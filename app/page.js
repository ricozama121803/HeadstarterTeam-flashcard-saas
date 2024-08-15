"use client";
import Image from "next/image";
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
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"; // Assuming you're using Clerk.js
import getStripe from "../utils/get-stripe"; // Assuming you have a utility to get Stripe instance
import { useRouter } from "next/navigation";

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
      <AppBar position="static" sx={{ backgroundColor: "#333" }}>
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

      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", my: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Welcome to Flashcard SaaS
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            The easiest way to create flashcards from your text.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, mr: 2, px: 4, py: 2 }}
            onClick={() => router.push("/generate-flashcard")}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 3, px: 4, py: 2 }}
          >
            Learn More
          </Button>
        </Box>

        <Box sx={{ my: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ textAlign: "center", color: "#333", fontWeight: "bold" }}
          >
            Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Feature 1
                  </Typography>
                  <Typography variant="body1">Feature 1</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Feature 2
                  </Typography>
                  <Typography variant="body1">Feature 2</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Feature 3
                  </Typography>
                  <Typography variant="body1">Feature 3</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 8, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ color: "#333", fontWeight: "bold" }}
          >
            Pricing
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {/* Pricing plans */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 4, textAlign: "center" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Basic Plan
                  </Typography>
                  <Typography variant="body1">$9.99 / month</Typography>
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
              <Card sx={{ p: 4, textAlign: "center" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Pro Plan
                  </Typography>
                  <Typography variant="body1">$19.99 / month</Typography>
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
      </Container>
    </>
  );
}
