import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "/firebase";
import { Box, CircularProgress } from "@mui/material";
import FlashcardsGrid from "../flashcard/flashcardGrid";

function FlashcardsView({ userId, setId }) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const flashcardsCollectionRef = collection(
          db,
          `users/${userId}/flashcardSets/${setId}/flashcards`
        );
        const flashcardsSnapshot = await getDocs(flashcardsCollectionRef);
        const cards = flashcardsSnapshot.docs.map((doc) => doc.data());
        setFlashcards(cards);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [userId, setId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={50} thickness={4} color="primary" />
      </Box>
    );
  }

  if (flashcards.length === 0) {
    return <p>No flashcards found in this set.</p>;
  }

  return (
    <Box>
      <h2>Flashcards</h2>
      <FlashcardsGrid
        flashcards={flashcards.map((card) => ({
          front: (
            <div>
              <h3>Front</h3>
              <p>{card.front}</p>
            </div>
          ),
          back: (
            <div>
              <h3>Back</h3>
              <p>{card.back}</p>
            </div>
          ),
        }))}
      />
    </Box>
  );
}

export default FlashcardsView;
