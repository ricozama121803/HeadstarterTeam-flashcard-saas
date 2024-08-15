"use client";

import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ButtonGroup,
} from "@mui/material";
import FlashcardsGrid from "../flashcard/flashcardGrid";
import { db, collection, addDoc } from '/firebase';
import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

export default function Generate() {
  const { isLoaded, isSignedIn, signOut, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState("text");

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      setLoading(false);
    } else {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter some text to generate flashcards.");
      return;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("An error occurred while generating flashcards. Please try again.");
    }
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const saveFlashcards = async () => {
    if (!setName.trim()) {
      alert("Please enter a name for your flashcard set.");
      return;
    }

    try {
      const batch = writeBatch(db);
      const sanitizedSetName = setName.replace(/[^\w\s]/gi, "");
      const userDocRef = doc(db, "users", userId);

      console.log("Fetching user document...");
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const flashcardSets = userDocSnap.data().flashcardSets || [];
        console.log("Existing flashcard sets:", flashcardSets);

        if (flashcardSets.some((set) => set.name === sanitizedSetName)) {
          alert("A flashcard set with the same name already exists.");
          return;
        } else {
          flashcardSets.push({ name: sanitizedSetName });
          batch.update(userDocRef, { flashcardSets });
        }
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: sanitizedSetName }] });
      }

      const flashcardSetsCollectionRef = collection(
        db,
        `users/${userId}/flashcardSets`
      );
      const setDocRef = doc(flashcardSetsCollectionRef, sanitizedSetName);

      flashcards.forEach((flashcard, index) => {
        const docRef = doc(
          collection(setDocRef, "flashcards"),
          `flashcard_${index}`
        );
        console.log("Saving flashcard:", flashcard);
        batch.set(docRef, flashcard);
      });

      await batch.commit();

      alert("Flashcards saved successfully!");
      handleCloseDialog();
      setSetName("");
    } catch (error) {
      console.error("Error saving flashcards:", error);
      alert("An error occurred while saving flashcards. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={50} thickness={4} color="primary" />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#040f24" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            Generate Flashcards
          </Typography>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{
              mb: 3,
              backgroundColor: "transparent",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#878282",
                },
                "&:hover fieldset": {
                  borderColor: "#878282",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#878282",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#fff",
              },
              "& .MuiInputBase-input": {
                color: "#fff",
              },
            }}
          />
          <ButtonGroup fullWidth sx={{ py: 2, fontSize: "1rem" }}>
            <Button
              variant={submissionType==="text" ? "contained" : "outlined"}
              color="secondary"
              onClick={()=>{setSubmissionType("text")}}
            >
              Text
            </Button>
            <Button
              variant={submissionType==="link" ? "contained" : "outlined"}
              color="secondary"
              onClick={()=>{setSubmissionType("link")}}
            >
              Link
            </Button>
          </ButtonGroup>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{ py: 2, fontSize: "1rem" }}
          >
            Generate Flashcards
          </Button>
        </Box>

        {flashcards.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              Generated Flashcards
            </Typography>
            <FlashcardsGrid flashcards={flashcards} />

            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDialog}
                sx={{ px: 4, py: 2, fontSize: "1rem" }}
              >
                Save Flashcards
              </Button>
            </Box>
          </Box>
        )}

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Save Flashcard Set</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a name for your flashcard set.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Set Name"
              type="text"
              fullWidth
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={saveFlashcards} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
