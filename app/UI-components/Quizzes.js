import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
  FormLabel,
  Snackbar,
  Alert,
} from "@mui/material";

const Quiz = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedAnswerStatus, setSelectedAnswerStatus] = useState("");
  const [rightAnswer, setRightAnswer] = useState("");

  const handleOptionClick = (option) => {
    if (selectedOption) return; // Prevent re-selection

    setSelectedOption(option);
    setRightAnswer(questions[currentQuestion].answer);

    if (option === questions[currentQuestion].answer) {
      setSelectedAnswerStatus("correct");
    } else {
      setSelectedAnswerStatus("incorrect");
    }
  };

  const handleSubmit = () => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    } else {
    }
    setOpenSnackbar(true);
    setSelectedOption("");
    setSelectedAnswerStatus("");
    setCurrentQuestion(currentQuestion + 1);
    setRightAnswer("");
  };

  const handleFinish = () => {
    if (
      currentQuestion < questions.length &&
      selectedOption === questions[currentQuestion].answer
    ) {
      setScore(score + 1);
    } else {
      setScore(0);
    }

    setOpenSnackbar(true);
    setSelectedOption("");
    setSelectedAnswerStatus("");
    setCurrentQuestion(0);
    setRightAnswer("");
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (currentQuestion >= questions.length) {
    return (
      <Container
        sx={{
          textAlign: "center",
          marginTop: "2rem",
          bgcolor: "#121212",
          padding: "2rem",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "#fff" }}>
          Quiz Completed
        </Typography>
        <Typography variant="h6" sx={{ color: "#fff" }}>
          Your final score is {score}/{questions.length}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinish}
          sx={{ marginTop: "1rem" }}
        >
          Restart Quiz
        </Button>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        textAlign: "center",
        marginTop: "2rem",
        padding: "2rem",
        borderRadius: "8px",
        width: "100%",
        textAlign: "center",
        bgcolor: "#B26488",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
        {currentQuestion + 1}. {questions[currentQuestion].question}
      </Typography>
      <FormControl component="fieldset" sx={{ color: "#fff" }}>
        <FormLabel component="legend" sx={{ color: "#fff" }}>
          Choose an option:
        </FormLabel>
        <RadioGroup value={selectedOption} onChange={() => {}}>
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleOptionClick(option)}
              sx={{
                color: "#fff",
                backgroundColor:
                  option === selectedOption
                    ? selectedAnswerStatus === "correct"
                      ? "#a7c957" // green
                      : "#d62839" // red
                    : option === rightAnswer && selectedOption !== rightAnswer
                    ? "#a7c957" // green
                    : "#333", // default
                margin: "0.5rem",
                width: "100%",
                borderRadius: "8px",
                textAlign: "left",
                justifyContent: "flex-start",
                "&:hover": {
                  backgroundColor:
                    option === selectedOption
                      ? selectedAnswerStatus === "correct"
                        ? "darkgreen"
                        : "darkred"
                      : option === rightAnswer && selectedOption !== rightAnswer
                      ? "darkgreen"
                      : "#555",
                },
              }}
            >
              {option}
            </Button>
          ))}
        </RadioGroup>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              marginTop: "1rem",
              width: "20rem",
              height: "3rem",
              fontSize: "1rem",
              "&:hover": {
                backgroundColor: "#ffffff",
                color: "#3f51b5",
              },
            }}
            onClick={
              currentQuestion === questions.length ? handleFinish : handleSubmit
            }
          >
            {currentQuestion === questions.length ? "Finish" : "Next Question"}
          </Button>
        </div>
      </FormControl>
    </Container>
  );
};

export default Quiz;
