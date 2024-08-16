import { TextField } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import validator from 'validator';

const styleMap = {
    "youtube": {
        label: "Enter Youtube URL",
        fullWidth: true,
        multiline: false,
        rows: 1,
        variant: "outlined",
        sx: {
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
        },
    },
    "text": {
        label: "Enter text",
        fullWidth: true,
        multiline: true,
        rows: 4,
        variant: "outlined",
        sx: {
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
        },
    },
}

const helpPrompts = {
    "youtube": "Please enter a valid url",
    "text": "Please enter valid text",
}

const TextEntryField = ({input, inputType, handleInputChange, invalid}) => {
    // hoping enter error mode on invalid change
    return (
        <TextField
            error={invalid}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            helperText={invalid ? helpPrompts[inputType] : ""}
            {...styleMap[inputType]}
        />
    );
};

const InputField = ({input, inputType, handleInputChange, invalid}) => {
    {/*
        For text inputs will display text field with appropriate validators assigned based on inputType
        For pdf input will display upload form
    */}

    if (typeof input === "string"){
        return TextEntryField({input, inputType, handleInputChange, invalid});
    }


};

export default InputField;