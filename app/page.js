"use client";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import getStripe from "../utils/get-stripe";
import { useRouter } from "next/navigation";
import { Lightbulb as LightIcon, School as SchoolIcon, AutoStories as StoryIcon } from "@mui/icons-material";

export default function Home() {
  const router = useRouter();

  const handleSubmit = async () => {
    const checkoutSession = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    const checkoutSessionJson = await checkoutSession.json();

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#040f24" }}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in" sx={{ ml: 2 }}>
              Login
            </Button>
            <Button color="inherit" href="/sign-up" sx={{ ml: 2 }}>
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      {/* Front Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", my: 8 }}>
        <Typography
        variant="h1"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 5,
          background: "linear-gradient(90deg, #578596, #579659)", // Gradient colors
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text", 
          textFillColor: "transparent", 
          fontFamily: "Times New Roman, serif",
          fontSize: "4rem", 
        }}
      >
      Empower Your Learning!
    </Typography>

          <Typography variant="h5" component="h4" gutterBottom sx={{ mb: 4, color: "#dce3dc" }}>
            Choose your subject, craft your flashcards, <br />
            and let our smart platform guide your learning journey. <br />
            ➝ Effortless Learning ➝ Endless Possibilities!
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 3,
              mr: 2,
              px: 4,
              py: 2,
              borderRadius: '7px',
              backgroundColor: "#4caf50", 
              color: "#fff", // Text color
              '&:hover': {
                backgroundColor: "#388e3c", 
              }
            }}
            onClick={() => router.push("/generate-flashcard")}
          >
            Get Started
          </Button>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 2, px: 12, mt: 13, mb: 15 }}> 
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", color: "#dce3dc", fontWeight: "bold", mb: 8, }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                backgroundColor: "transparent",
                transition: "transform 0.3s ease-in-out",
                border: "2px solid grey",
                borderRadius: "9px",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                },
              }}
            >
              <CardContent>
                <LightIcon sx={{ fontSize: 40, color: "#fff", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" , mb: 1}}>
                  Smart Flashcards
                </Typography>
                <Typography variant="body1" sx={{ color: "#878282" }}>
                  Our AI intelligently breaks down your text into concise flashcards, perfect for studying.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                backgroundColor: "transparent",
                transition: "transform 0.3s ease-in-out",
                border: "2px solid grey",
                borderRadius: "9px",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                },
              }}
            >
              <CardContent>
                <SchoolIcon sx={{ fontSize: 40, color: "#fff", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" , mb: 1}}>
                  Feature 2
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff" }}>
                  Feature 2 description
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 3,
                backgroundColor: "transparent",
                transition: "transform 0.3s ease-in-out",
                border: "2px solid grey",
                borderRadius: "9px",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                },
              }}
            >
              <CardContent>
                <StoryIcon sx={{ fontSize: 40, color: "#fff", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" , mb: 1}}>
                  Feature 3
                </Typography>
                <Typography variant="body1" sx={{ color: "#fff" }}>
                  Feature 3 description
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 8, px: 12, mt: 13, mb: 15, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          sx={{ color: "#dce3dc", fontWeight: "bold", mb: 8 }}
        >
          Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "transparent",
                transition: "transform 0.3s ease-in-out",
                border: "2px solid grey",
                borderRadius: "9px",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Free Plan
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontSize: "1.5rem", color: "#fff" }}>
                  $0 / month
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontSize: "1.3rem", color: "#878282" }}>
                  Access to basic flashcard features.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, px: 4, py: 2 }}
                  onClick={() => router.push("/sign-up")}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "transparent",
                transition: "transform 0.3s ease-in-out",
                border: "2px solid grey",
                borderRadius: "9px",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Basic Plan
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontSize: "1.5rem", color: "#fff" }}>
                  $9.99 / month
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontSize: "1.3rem", color: "#878282" }}>
                  Access to basic flashcard features.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, px: 4, py: 2 }}
                  onClick={handleSubmit}
                >
                  Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "transparent",
                transition: "transform 0.3s ease-in-out",
                border: "2px solid grey",
                borderRadius: "9px",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  border: "2px solid white",
                },
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff" }}>
                  Pro Plan
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontSize: "1.5rem", color: "#fff" }}>
                  $19.99 / month
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontSize: "1.3rem", color: "#878282" }}>
                  Access to basic flashcard features.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, px: 4, py: 2 }}
                  onClick={handleSubmit}
                >
                  Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
{/* Call to Action Section */}
<Box sx={{ py: 8, px: 10, textAlign: "center", color: "#fff" }}>
<Typography
    variant="h3"
    component="h4"
    gutterBottom
    sx={{ mb: 4, fontWeight: "bold" , fontFamily: "Times New Roman, serif" }}
  >
   Save yourself hours and ace your exams
  </Typography>
  <Typography
    variant="h5"
    component="h6"
    gutterBottom
    sx={{ mb: 4, fontWeight: "bold" }}
  >
  Sign up for a free trial and experience the future of learning!
  </Typography>
  <Button
    variant="contained"
    sx={{
      mt: 2,
      mr: 2,
      px: 4,
      py: 2,
      borderRadius: '7px',
      backgroundColor: "#4caf50",
      color: "#fff", 
      '&:hover': {
        backgroundColor: "#388e3c",
      }
    }}
    onClick={() => router.push("/sign-up")}
  >
    Get Started
  </Button>
  
</Box>
    {/* Footer Section */}
    <Box sx={{ py: 2, textAlign: "center", backgroundColor: "#130221", color: "#fff", mt: 8 }}>
        <Typography variant="body3">
          © 2024 Flashcard AI. All rights reserved.
        </Typography>
      </Box>

    </>
  );
}
