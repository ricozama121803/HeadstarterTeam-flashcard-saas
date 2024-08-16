// components/WaitlistForm.js
import React, { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

const WaitlistForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const waitlistRef = collection(db, "waitlist");
      await addDoc(waitlistRef, {
        name,
        email,
        timestamp: new Date(),
      });
      alert("You have been added to the waitlist!");
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error adding you to the waitlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        style={{
          color: "#fff",
          fontSize: "2.5rem",
          fontWeight: "bold",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
        }}
      >
        Join our Exclusive Waitlist
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          InputLabelProps={{
            style: { color: "#fff" },
          }}
          InputProps={{
            style: { color: "#fff" },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#ffffff80",
              },
              "&:hover fieldset": {
                borderColor: "#ffffff",
              },
            },
          }}
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          InputLabelProps={{
            style: { color: "#fff" },
          }}
          InputProps={{
            style: { color: "#fff" },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#ffffff80",
              },
              "&:hover fieldset": {
                borderColor: "#ffffff",
              },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          style={{
            marginTop: "1rem",
            width: "50%",
            height: "3rem",
            fontSize: "1rem",
            hover: {
              backgroundColor: "#ffffff",
            },
          }}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Container>
  );
};

export default WaitlistForm;
