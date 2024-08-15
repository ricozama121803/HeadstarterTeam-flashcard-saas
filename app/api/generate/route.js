import { NextResponse } from "next/server";
import OpenAI from "openai";

const flashcardsPrompt = `
You are a flashcard creator. Take the following text and generate exactly 10 flashcards. Each flashcard should have a front and back, both being a single sentence.

Return the result in the following JSON format:
{
  "flashcards": [
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}`;

const quizzesPrompt = `
You are a quiz creator. Take the following text and generate 5 quiz questions. Each question should have 4 multiple-choice options, one correct answer, and three distractors.

Return the result in the following JSON format:
{
  "quizzes": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Correct option"
    }
  ]
}`;

export async function POST(req) {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const { text, type } = await req.json();
  const systemPrompt = type === "Flashcards" ? flashcardsPrompt : quizzesPrompt;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    });
    if (type === "Quizzes") {
      const quizzes = JSON.parse(completion.choices[0].message.content);

      return NextResponse.json(quizzes.quizzes);
    } else {
      const flashcards = JSON.parse(completion.choices[0].message.content);
      return NextResponse.json(flashcards.flashcards);
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
