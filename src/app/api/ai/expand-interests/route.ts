import { NextRequest } from "next/server";
import { z } from "zod";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";

export const runtime = "edge";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for the request body
const requestSchema = z.object({
  interests: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { interests } = result.data;
    
    // Construct the system prompt
    const systemPrompt = `
      You are an expert at understanding and expanding user interests.
      Given a list of interests, expand each one into related categories and specific aspects
      that might be relevant for place recommendations.
      
      Your response should be conversational at first, explaining how these interests can be expanded,
      then provide specific expansions for each interest.
    `;
    
    // Construct the user prompt
    const userPrompt = `
      Here are my interests: ${interests.join(", ")}
      
      Please expand each interest into related categories and specific aspects that might be relevant
      for place recommendations. For each interest, provide 5-7 related sub-interests or specific aspects.
      
      Also suggest 3 natural language queries I might use to find places related to these interests.
    `;
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      stream: true,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });
    
    // Create a stream from the OpenAI response
    const stream = OpenAIStream(response);
    
    // Return a StreamingTextResponse, which is compatible with anything that expects a ReadableStream
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in expand-interests API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 