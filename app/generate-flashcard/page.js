"use client"; // Ensure this is at the top

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
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import FlashcardSets from "../UI-components/FlashcardSets";
import FlashcardsView from "../UI-components/FlashcardsView";
import FlashcardsGrid from "../flashcard/flashcardGrid";
import { db } from "/firebase";
import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import MyForm from "../UI-components/type";
import Quiz from "../UI-components/Quizzes";
import {
  collection,
  doc,
  writeBatch,
  getDoc,
} from "firebase/firestore";

export default function Generate() {
  const { isLoaded, isSignedIn, signOut, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [outputType, setOutputType] = useState("Flashcards");
  const [inputType, setInputType] = useState("text");
  const [selectedSet, setSelectedSet] = useState(null);

  const router = useRouter();

  // Switch between flashcards and quizzes based on the selected output type
  useEffect(() => {
    if (outputType === "Quizzes") {
      setFlashcards([]);
    } else {
      setQuizzes([]);
    }
  }, [outputType]);

  // Handle user authentication and loading state
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (isSignedIn) {
      setLoading(false);
    } else {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle sign-out and redirect to the home page
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Handle content generation (flashcards or quizzes)
  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter some text to generate content.");
      return;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text, outputType, inputType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      if (outputType === "Quizzes") {
        setQuizzes(data);
      } else {
        setFlashcards(data);
      }
    } catch (error) {
      alert("An error occurred while generating content. Please try again.");
    }
  };

  // Handle dialog open/close for saving content
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  // Save content to Firestore
  const saveContent = async () => {
    if (!setName.trim()) {
      alert("Please enter a name for your content set.");
      return;
    }
  
    try {
      const sanitizedSetName = setName.replace(/[^\w\s]/gi, "");
      const flashcardsCollectionRef = collection(
        db,
        `users/${userId}/flashcardSets`
      );
      const setDocRef = doc(flashcardsCollectionRef, sanitizedSetName);
  
      // Write the document with only the name field
      await setDocRef.set({
        name: sanitizedSetName,
        createdAt: new Date(),
      });
  
      const batch = writeBatch(db);
  
      flashcards.forEach((flashcard, index) => {
        const docRef = doc(
          collection(setDocRef, "flashcards"),
          `flashcard_${index}`
        );
        batch.set(docRef, flashcard);
      });
  
      await batch.commit();
      alert("Content saved successfully!");
      handleCloseDialog();
      setSetName(""); // Clear the input field after saving
    } catch (error) {
      alert("An error occurred while saving content. Please try again.");
      console.error("Error saving content:", error);
    }
  };
  
  
  
  
  
  

  // Display loading state while authenticating the user
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

  // Handle selecting a flashcard set to view
  const handleSelectSet = (setId) => {
    setSelectedSet(setId);
  };

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

      {!selectedSet ? (
        <FlashcardSets userId={userId} onSelectSet={handleSelectSet} />
      ) : (
        <FlashcardsView userId={userId} setId={selectedSet} />
      )}

      <Container>
        <Box sx={{ my: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            Generate {outputType}
          </Typography>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label={inputType === "text" ? "Enter text" : "Enter URL"}
            fullWidth
            multiline
            rows={inputType === "text" ? 3 : 1}
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
              variant={inputType === "text" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => {
                setInputType("text");
              }}
            >
              Text
            </Button>
            <Button
              variant={inputType === "youtube" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => {
                setInputType("youtube");
              }}
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
            Generate {outputType}
          </Button>
        </Box>
        {quizzes.length > 0 && outputType === "Quizzes" ? (
          <Quiz questions={quizzes} />
        ) : (
          flashcards.length > 0 && (
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
            </Box>
          )
        )}

        {(quizzes.length > 0 || flashcards.length > 0) && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
              sx={{ px: 4, py: 2, fontSize: "1rem" }}
            >
              Save {outputType}
            </Button>
          </Box>
        )}

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Save {outputType} Set</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a name for your {outputType} set.
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
            <Button onClick={saveContent} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
