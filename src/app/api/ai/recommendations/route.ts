import { NextRequest } from "next/server";
import { z } from "zod";

import { streamOpenAI } from "@/lib/ai";

export const runtime = "edge";

// Validation schema for the request body
const requestSchema = z.object({
  query: z.string().optional(),
  interests: z.array(z.string()).optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  radius: z.number().optional(),
  type: z.string().optional(),
  limit: z.number().default(5),
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
    
    const { query, interests, location, radius, type, limit } = result.data;
    
    // Check if we have sufficient data for a recommendation
    if (!query && (!interests || interests.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Either query or interests must be provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Prepare system prompt based on available data
    let systemPrompt = `
      You are an expert location and place recommendation assistant.
      You specialize in finding and suggesting places that match users' interests and preferences.
      Always provide thoughtful, specific recommendations with details like why you're recommending them.
      Your recommendations should be informative, highlighting key features of each place.
      
      Format your response as a conversational paragraph followed by a bulleted list of specific recommendations.
      For each recommendation, include:
      - Name of the place
      - Brief description
      - Why it matches their interests
      - Location details when available
      - Any special features
      
      Limit your response to ${limit} recommendations.
    `;
    
    // Prepare user prompt based on query or interests
    let userPrompt = "";
    
    if (query) {
      userPrompt = `Find places matching this request: "${query}"`;
    } else if (interests && interests.length > 0) {
      userPrompt = `Find places matching these interests: ${interests.join(", ")}`;
    }
    
    // Add location context if available
    if (location) {
      userPrompt += `\nNearby coordinates: latitude ${location.latitude}, longitude ${location.longitude}`;
      
      if (radius) {
        userPrompt += ` within ${radius} kilometers`;
      }
    }
    
    // Add type filter if available
    if (type) {
      userPrompt += `\nFilter to this type of place: ${type}`;
    }
    
    // Stream the AI response
    return streamOpenAI({
      systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 