import React, { useState } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

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
    <FormControl
      sx={{
        minWidth: 120,
        borderRadius: "4px",
        padding: "0.5rem",
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
        value={selectedValue}
        onChange={handleChange}
        sx={{
          "& .MuiSelect-select": {
            color: "#ffffff", // Text color in the select box
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          bgcolor: "#333",
        }}
      >
        <MenuItem value={"Flashcards"}>Flashcards</MenuItem>
        <MenuItem value={"Quizzes"}>Quizzes</MenuItem>
      </Select>
    </FormControl>
  );
};

export default MyForm;
