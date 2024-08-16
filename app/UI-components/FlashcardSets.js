import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/firebase';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

function FlashcardSets({ userId, onSelectSet }) {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const flashcardSetsCollectionRef = collection(db, `users/${userId}/flashcardSets`);
        const flashcardSetsSnapshot = await getDocs(flashcardSetsCollectionRef);
        const sets = flashcardSetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlashcardSets(sets);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching flashcard sets:", error);
        setLoading(false);
      }
    };

    fetchSets();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={50} thickness={4} color="primary" />
      </Box>
    );
  }

  if (flashcardSets.length === 0) {
    return <p>No flashcard sets found.</p>;
  }

  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center">
      {flashcardSets.map(set => (
        <Card
          key={set.id}
          sx={{
            width: 300,
            m: 2,
            backgroundColor: "#1e1e2f",
            color: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            "&:hover": {
              transform: "scale(1.05)",
              transition: "transform 0.3s ease-in-out",
            },
          }}
        >
          <CardActionArea onClick={() => onSelectSet(set.id)}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                {set.name}
              </Typography>
             
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}

export default FlashcardSets;
