import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";

const MyForm = ({ onSelectionChange }) => {
  const [selectedValue, setSelectedValue] = useState("Flashcards");
  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);

    if (onSelectionChange) {
      onSelectionChange(value);
    }
  };
  return (
    <>
      <FormControl
        sx={{
          minWidth: 120,

          borderRadius: "4px",
          padding: "0.5rem",
          // Optional shadow to stand out
          boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        <InputLabel
          sx={{
            color: "#ffffff",
          }}
        >
          Type
        </InputLabel>
        <Select
          onChange={handleChange}
          defaultValue={"Flashcard"}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff",
            },
          }}
        >
          <MenuItem value={"Flashcards"}>Flashcard</MenuItem>
          <MenuItem value={"Quizzes"}>Quizzes</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};
export default MyForm;
