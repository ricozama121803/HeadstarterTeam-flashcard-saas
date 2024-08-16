"use client";

import { use, useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  AppBar,
  Toolbar,
  InputLabel,
  ButtonGroup,
} from "@mui/material";
import FlashcardsGrid from "../flashcard/flashcardGrid";
import { db } from "/firebase";
import { useAuth } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import MyForm from "../UI-components/type";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Quiz from "../UI-components/Quizzes";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import InputField from "./inputField";
import { matches } from "validator";
export default function Generate() {
  const { getToken, isLoaded, isSignedIn, signOut, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [setName, setSetName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [outputType, setOutputType] = useState("Flashcards");
  const [inputType, setInputType] = useState("text");
  const [isValidInput, setIsValidInput] = useState(true);

  const router = useRouter();
  const styles = {
    card: { background: "blue", color: "white", borderRadius: 20 },
  };

  useEffect(() => {
    if (outputType === "Quizzes") {
      setFlashcards([]);
    } else {
      setQuizzes([]);
    }
  }, [outputType]);
  const handleSelectionChange = (value) => {
    setOutputType(value);
  };

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

  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?([a-zA-Z0-9_-]{11})$/;

  const validateText = async () => {
    if (inputType === "text"){
      return (typeof text === "string")
    }

    if (inputType === "youtube"){
      return ((typeof text === "string") && matches(text, youtubePattern));
    }
  }

  // Sign out user when user clicks the sign-out button
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSubmit = async () => {
    const valid = await validateText();
    setIsValidInput(valid);
    if (!valid){
      return;
    }
    if (!text.trim()) {
      alert("Please enter some text to generate flashcards.");
      return;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text, outputType, inputType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      if (outputType === "Quizzes") {
        setQuizzes(data);
      } else {
        setFlashcards(data);
      }
    } catch (error) {
      alert("An error occurred while generating flashcards. Please try again.");
    }
  };

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const saveContent = async () => {
    if (!setName.trim()) {
      alert("Please enter a name for your content set.");
      return;
    }

    try {
      const batch = writeBatch(db);
      const sanitizedSetName = setName.replace(/[^\w\s]/gi, "");
      const userDocRef = doc(db, "users", userId);

      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const contentSets = userDocSnap.data().contentSets || [];

        if (contentSets.some((set) => set.name === sanitizedSetName)) {
          alert("A content set with the same name already exists.");
          return;
        } else {
          contentSets.push({ name: sanitizedSetName });
          batch.update(userDocRef, { contentSets });
        }
      } else {
        batch.set(userDocRef, { contentSets: [{ name: sanitizedSetName }] });
      }

      // Check the type and handle accordingly
      if (outputType === "Flashcards") {
        const flashcardsCollectionRef = collection(
          db,
          `users/${userId}/flashcardSets`
        );
        const setDocRef = doc(flashcardsCollectionRef, sanitizedSetName);

        flashcards.forEach((flashcard, index) => {
          const docRef = doc(
            collection(setDocRef, "flashcards"),
            `flashcard_${index}`
          );

          batch.set(docRef, flashcard);
        });
      } else if (outputType === "Quizzes") {
        const quizzesCollectionRef = collection(db, `users/${userId}/quizSets`);
        const setDocRef = doc(quizzesCollectionRef, sanitizedSetName);

        quizzes.forEach((quiz, index) => {
          const docRef = doc(collection(setDocRef, "quizzes"), `quiz_${index}`);

          batch.set(docRef, quiz);
        });
      }

      await batch.commit();
      alert("Content saved successfully!");
      handleCloseDialog();
      setSetName("");
    } catch (error) {
      alert("An error occurred while saving content. Please try again.");
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
            QuizzAI
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      {/* Selecting the type from the user */}
      <div
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <MyForm onSelectionChange={handleSelectionChange} />
      </div>
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
          <InputField
            input={text}
            inputType={inputType}
            handleInputChange={setText}
            invalid={!isValidInput}
          />
          <ButtonGroup fullWidth sx={{ py: 2, fontSize: "1rem" }}>
            <Button
              variant={inputType === "text" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => {
                setInputType("text");
                setIsValidInput(true);
              }}
            >
              Text
            </Button>
            <Button
              variant={inputType === "youtube" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => {
                setInputType("youtube");
                setIsValidInput(true);
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
        <div
          style={{
            width: "100%",
            height: "200px",
          }}
        ></div>
      </Container>
    </>
  );
}
