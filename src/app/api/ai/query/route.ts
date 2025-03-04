import { NextRequest } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";

export const runtime = "edge";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-token-for-build-process',
});

// Validation schema for the request body
const requestSchema = z.object({
  query: z.string(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  userInterests: z.array(z.string()).optional(),
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
    
    const { query, location, userInterests } = result.data;
    
    // If this is a Vercel build process and we have a placeholder token, return mock data
    if (process.env.OPENAI_API_KEY === undefined || process.env.OPENAI_API_KEY === 'sk-placeholder-token-for-build-process') {
      return new Response(
        JSON.stringify({
          response: `This is a placeholder response for your query: "${query}". In production, this would provide real recommendations based on your location and interests.`
        }),
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }
    
    // Construct the system prompt
    const systemPrompt = `
      You are an expert location and place recommendation assistant.
      You specialize in finding and suggesting places that match users' natural language queries.
      Always provide thoughtful, conversational responses that directly address the user's query.
      
      Your goal is to interpret what the user is looking for and provide helpful recommendations.
      
      Format your response as a conversational answer that addresses their query directly,
      followed by specific place recommendations when appropriate.
      
      For each recommendation, include:
      - Name of the place
      - Brief description
      - Why it's relevant to their query
      - Location details when available
      - Any special features
      
      Limit your recommendations to 3-5 places unless specified otherwise.
    `;
    
    // Construct the user prompt with additional context
    let userPrompt = `${query}`;
    
    // Add location context if available
    if (location) {
      userPrompt += `\n\nContext: I'm currently near latitude ${location.latitude}, longitude ${location.longitude}.`;
    }
    
    // Add user interests if available
    if (userInterests && userInterests.length > 0) {
      userPrompt += `\n\nMy interests include: ${userInterests.join(", ")}.`;
    }
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        }
      ],
    });

    // Extract the content
    const content = response.choices[0].message.content?.trim() || "Sorry, I couldn't generate any recommendations.";

    // Return the response
    return new Response(
      JSON.stringify({ response: content }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in query API:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to process query",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 