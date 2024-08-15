import { Grid, useMediaQuery } from "@mui/material";
import ReactFlipCard from "reactjs-flip-card";
import { useTheme } from "@mui/material/styles";

const Flashcard = ({ frontComponent, backComponent }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <ReactFlipCard
      flipDirection="horizontal"
      flipTrigger="onClick"
      transitionDuration={"1000s"}
      containerStyle={{
        width: isSmallScreen ? "90%" : "250px",
        height: "250px",
        margin: "auto",
      }}
      frontComponent={frontComponent}
      backComponent={backComponent}
      frontStyle={{
        ...styles.card,
        ...{ backgroundColor: "lightslategray", fontWeight: "bold" },
      }}
      backStyle={{ ...styles.card, ...{ backgroundColor: "lightcoral" } }}
    />
  );
};

const FlashcardsGrid = ({ flashcards }) => {
  return (
    <Grid container spacing={6} padding={2}>
      {flashcards.map((flashcard, index) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <Flashcard
            frontComponent={flashcard.front}
            backComponent={flashcard.back}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const styles = {
  card: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.4rem",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.9)",
  },
};

export default FlashcardsGrid;
