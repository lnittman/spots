import { NextRequest } from "next/server";
import { z } from "zod";

import { streamOpenAI } from "@/lib/ai";

export const runtime = "edge";

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
    
    // Stream the AI response
    return streamOpenAI({
      systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });
  } catch (error) {
    console.error("Error in query API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 