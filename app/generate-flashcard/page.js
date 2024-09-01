"use client"; // Ensure this is at the top

import { useEffect, useState, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Chip,
  IconButton,
} from "@mui/material";
import FlashcardsView from "../UI-components/FlashcardsView";
import FlashcardsGrid from "../flashcard/flashcardGrid";
import { db } from "/firebase";
import { useAuth } from "@clerk/clerk-react";
import Quiz from "../UI-components/Quizzes";
import {
  collection,
  doc,
  writeBatch,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";

function FlashcardSets({ userId, onSelectSet, onDeleteSet }) {
  const [flashcardSets, setFlashcardSets] = useState([]);

  useEffect(() => {
    const fetchSets = async () => {
      // Fetch flashcard sets
      const flashcardSetsRef = collection(db, `users/${userId}/flashcardSets`);
      const flashcardSnapshot = await getDocs(flashcardSetsRef);
      const flashcardSets = flashcardSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch quiz sets
      const quizSetsRef = collection(db, `users/${userId}/quizSets`);
      const quizSnapshot = await getDocs(quizSetsRef);
      const quizSets = quizSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Combine both sets and update state
      setFlashcardSets([...flashcardSets, ...quizSets]);
    };

    fetchSets();
  }, [userId]);

  const handleDeleteSet = async (setId, isQuiz) => {
    const collectionName = isQuiz ? "quizSets" : "flashcardSets";
    if (window.confirm("Are you sure you want to delete this set?")) {
      try {
        await deleteDoc(doc(db, `users/${userId}/${collectionName}/${setId}`));
        setFlashcardSets((prevSets) => prevSets.filter((set) => set.id !== setId));
        onDeleteSet(setId); // Update the selected set if it's the one being deleted
      } catch (error) {
        console.error("Error deleting set:", error);
        alert("An error occurred while deleting the set. Please try again.");
      }
    }
  };

  return (
    <Accordion sx={{ backgroundColor: "transparent", color: "white", boxShadow: "none" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}>
        <Typography>Saved Sets</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {flashcardSets.length > 0 ? (
          flashcardSets.map((set) => (
            <Box
              key={set.id}
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                sx={{ cursor: "pointer" }}
                onClick={() => onSelectSet(set)} // Pass the entire set object
              >
                {set.name}
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip
                  label={set.isQuiz ? "Quiz" : "Flashcards"}
                  color={set.isQuiz ? "primary" : "secondary"}
                  size="small"
                  sx={{ mr: 2 }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleDeleteSet(set.id, set.isQuiz)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))
        ) : (
          <Typography>No saved sets available.</Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

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
  const [isGenerating, setIsGenerating] = useState(false); // Loading state for generation
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const router = useRouter();
  const setRef = useRef(null); // Ref for scrolling

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

    // Clear previous set when generating new content
    setSelectedSet(null);
    setIsGenerating(true); // Set loading state

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text, outputType, inputType }),
        headers: {
          "Content-Type": "application/json",
        },
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
    } finally {
      setIsGenerating(false); // Reset loading state
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
      const collectionName = outputType === "Quizzes" ? "quizSets" : "flashcardSets";
      const setsCollectionRef = collection(db, `users/${userId}/${collectionName}`);
      const setDocRef = doc(setsCollectionRef, sanitizedSetName);

      // Write the document with only the name field using `setDoc`
      await setDoc(setDocRef, {
        name: sanitizedSetName,
        createdAt: new Date(),
        isQuiz: outputType === "Quizzes", // Store whether the set is a quiz
      });

      const batch = writeBatch(db);
      const items = outputType === "Quizzes" ? quizzes : flashcards;

      items.forEach((item, index) => {
        const docRef = doc(collection(setDocRef, outputType.toLowerCase()), `${outputType.toLowerCase()}_${index}`);
        batch.set(docRef, item);
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

  // Handle selecting a flashcard set or quiz set to view and scroll to it
  const handleSelectSet = async (set) => {
    setFlashcards([]);
    setQuizzes([]);
    setSelectedSet(set);

    const collectionName = set.isQuiz ? "quizSets" : "flashcardSets";
    if (set.isQuiz) {
      try {
        const quizDoc = await getDoc(doc(db, `users/${userId}/${collectionName}/${set.id}`));
        if (quizDoc.exists()) {
          const quizData = quizDoc.data();
          setQuizzes(quizData.questions || []);
          setCurrentQuestion(0); // Reset to the first question
          setSelectedOption(""); // Clear any selected option
          setScore(0); // Reset the score
        } else {
          setQuizzes([]);
        }
      } catch (error) {
        console.error("Error loading quiz questions:", error);
        setQuizzes([]);
      }
    } else {
      // Fetch flashcards similarly if it's not a quiz
    }

    setTimeout(() => {
      if (setRef.current) {
        setRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Handle set deletion update
  const handleDeleteSet = (setId, isQuiz) => {
    if (selectedSet && selectedSet.id === setId) {
      setSelectedSet(null);
    }
  };

  const handleRestartQuiz = () => {
    // Reset quiz state here
    setCurrentQuestion(0);
    setSelectedOption("");
    setScore(0);
    setQuizzes([]); // Clear the quiz questions
    setSelectedSet(null); // Assuming you need to clear selected set
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

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#040f24" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <FlashcardSets userId={userId} onSelectSet={handleSelectSet} onDeleteSet={handleDeleteSet} />
          <Button variant="contained" color="secondary" onClick={handleSignOut} sx={{ ml: 2 }}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Container */}
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
              onClick={() => setInputType("text")}
            >
              Text
            </Button>
            <Button
              variant={inputType === "youtube" ? "contained" : "outlined"}
              color="secondary"
              onClick={() => setInputType("youtube")}
            >
              Link
            </Button>
          </ButtonGroup>
          <ButtonGroup fullWidth sx={{ py: 2, fontSize: "1rem" }}>
            <Button
              variant={outputType === "Flashcards" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setOutputType("Flashcards")}
            >
              Flashcards
            </Button>
            <Button
              variant={outputType === "Quizzes" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setOutputType("Quizzes")}
            >
              Quizzes
            </Button>
          </ButtonGroup>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{ py: 2, fontSize: "1rem" }}
          >
            {isGenerating ? (
              <CircularProgress size={24} thickness={4} sx={{ color: "white" }} />
            ) : (
              `Generate ${outputType}`
            )}
          </Button>
        </Box>

        {/* Display Generated Quizzes or Flashcards */}
        {(quizzes.length > 0 || flashcards.length > 0) && (
          <>
            {quizzes.length > 0 && outputType === "Quizzes" && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{ textAlign: "center", fontWeight: "bold" }}
                >
                  Generated Quizzes
                </Typography>
                <Quiz
                  questions={quizzes}
                  currentQuestion={currentQuestion}
                  selectedOption={selectedOption}
                  score={score}
                  setCurrentQuestion={setCurrentQuestion}
                  setSelectedOption={setSelectedOption}
                  setScore={setScore}
                />
              </Box>
            )}

            {flashcards.length > 0 && outputType === "Flashcards" && (
              <Box sx={{ mt: 8, mb: 4 }}>
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
            )}
          </>
        )}

        {/* Display Selected Flashcard or Quiz Set */}
        {selectedSet && (
          <>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ textAlign: "center", fontWeight: "bold", mt: 4 }}
              ref={setRef}
            >
              {selectedSet.name}
            </Typography>
            {selectedSet.isQuiz ? (
              <Quiz
                questions={quizzes}
                currentQuestion={currentQuestion}
                selectedOption={selectedOption}
                score={score}
                setCurrentQuestion={setCurrentQuestion}
                setSelectedOption={setSelectedOption}
                setScore={setScore}
              />
            ) : (
              <FlashcardsView userId={userId} setId={selectedSet.id} />
            )}
          </>
        )}

        {/* Save Button and Dialog */}
        {(quizzes.length > 0 || flashcards.length > 0) && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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
