import { NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";

// Prompts for generating flashcards and quizzes
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

// Maps outputType to corresponding outputContext
const outputContext = {
  Flashcards: flashcardsPrompt,
  Quizzes: quizzesPrompt,
};

// Context for text-based input
const textContext = `
Follow these instructions: 
1. Identify input type: topics, textual content, key points, Q&As, vocabulary, or formulas.
2. Extract key information
3. Adapt to user preferences (difficulty level, focus areas).
4. Ensure clarity: Use clear questions and concise answers.
5. Maintain relevance: All cards should directly relate to the input.

Create effective learning tools from the given input, regardless of format or complexity.
`;

// Context for YouTube video transcripts
const youtubeContext = `
The input text is a transcript of a YouTube video. Follow these instructions:
1. Analyze the transcript: Identify main topics, key concepts, and important details.
2. Extract key information: Focus on central ideas, definitions, facts, and significant points.
3. Adapt to video type: Adjust focus for lectures, tutorials, or interviews.
4. Maintain clarity: Use original language, clarify ambiguities, simplify complex ideas.
5. Format output in the specified JSON structure.
6. Ensure clarity: Use clear questions and concise answers.

Distill video content into effective learning tools, capturing the essence of the information presented.
`;

// Maps inputType to corresponding inputContext
const inputContext = {
  text: textContext,
  youtube: youtubeContext,
};

// Formats input based on inputType
async function formatInput(input, inputType) {
  if (inputType === "youtube") {
    try {
      const transcriptList = await YoutubeTranscript.fetchTranscript(input);
      const transcript = transcriptList
        .map((transcript) => transcript.text)
        .join(" ");
      return transcript;
    } catch (error) {
      console.error("Error fetching YouTube transcript:", error);
      throw new Error("Failed to fetch YouTube transcript.");
    }
  }
  return input;
}

export async function POST(req) {
  // Check if the API key is set
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not set." },
      { status: 500 }
    );
  }

  // Start processing the request in the background
  processRequestInBackground(req);

  // Return immediately to avoid timeout issues
  return NextResponse.json({ status: "Processing started" });
}

async function processRequestInBackground(req) {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const { text, outputType, inputType } = await req.json();

  // Format the input text based on its type
  const formattedInput = await formatInput(text, inputType);

  // Construct the prompt for the OpenAI model
  const systemPrompt = `
    ${outputContext[outputType]}
    ${inputContext[inputType]}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Ensure the model name is correct
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: formattedInput },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated by the model.");
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      console.error("Raw content received:", content);

      // Handle non-JSON response gracefully
      return NextResponse.json(
        { error: "Invalid response from OpenAI: " + content },
        { status: 400 }
      );
    }

    // Save or process the generated content based on output type
    if (outputType === "Quizzes") {
      // Handle the quizzes here (e.g., save to a database)
      console.log(parsedContent.quizzes);
    } else {
      // Handle the flashcards here (e.g., save to a database)
      console.log(parsedContent.flashcards);
    }
  } catch (error) {
    console.error("Error generating content:", error);
  }
}
