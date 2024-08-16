import { NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";

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

// maps outputType to corresponding outputContext
const outputContext = {
  Flashcards: flashcardsPrompt,
  Quizzes: quizzesPrompt,
};

// used claude to make these could prob be improved
const textContext = `
Follow these instructions: 
1. Identify input type: topics, textual content, key points, Q&As, vocabulary, or formulas.
2. Extract key information
3. Adapt to user preferences (difficulty level, focus areas).
4. Ensure clarity: Use clear questions and concise answers.
5. Maintain relevance: All cards should directly relate to the input.

Create effective learning tools from the given input, regardless of format or complexity.
`;

const youtubeContext = `
The input text is a transcript of a youtube video, follow these instructions:
1. Analyze the transcript: Identify main topics, key concepts, and important details.
2. Extract key information: Focus on central ideas, definitions, facts, and significant points.
3. Adapt to video type: Adjust focus for lectures, tutorials, or interviews.
4. Maintain clarity: Use original language, clarify ambiguities, simplify complex ideas.
5. Format output in the specified JSON structure.
6. Ensure clarity: Use clear questions and concise answers.


Distill video content into effective learning tools, capturing the essence of the information presented.
`;

// maps inputType to corresponding inputContext
const inputContext = {
  text: textContext,
  youtube: youtubeContext,
};

// formats input based on inputType
async function formatInput(input, inputType) {
  if (inputType === "youtube") {
    const transcriptList = await YoutubeTranscript.fetchTranscript(input);
    const transcript = transcriptList
      .map((transcript) => transcript.text)
      .join(" ");
    return transcript;
  }
  return input;
}

export async function POST(req) {
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const { text, outputType, inputType } = await req.json();

  const formattedInput = await formatInput(text, inputType);
  const systemPrompt = outputContext[outputType] + inputContext[inputType];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: formattedInput },
      ],
    });
    if (outputType === "Quizzes") {
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
