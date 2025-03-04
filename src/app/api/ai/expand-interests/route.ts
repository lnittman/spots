import { NextRequest } from "next/server";
import { z } from "zod";
import { OpenAI } from "openai";

export const runtime = "edge";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-token-for-build-process',
});

// Schema for the request
const requestSchema = z.object({
  interests: z.array(z.string()),
  location: z.string().optional(),
  count: z.number().optional().default(5),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request
    const body = await req.json();
    const { interests, location, count } = requestSchema.parse(body);

    // If this is a Vercel build process and we have a placeholder token, return mock data
    if (process.env.OPENAI_API_KEY === undefined || process.env.OPENAI_API_KEY === 'sk-placeholder-token-for-build-process') {
      return new Response(
        JSON.stringify({
          interests: [
            ...interests,
            "coffee shops",
            "hiking trails",
            "bookstores",
            "museums",
            "local cuisine"
          ].slice(0, count)
        }),
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    // Prepare the prompt
    const prompt = `
      I have the following interests: ${interests.join(", ")}.
      ${location ? `I am visiting ${location}.` : ""}
      Can you suggest ${count} more related interests that I might enjoy exploring?
      Give me ONLY a JSON array of strings with no explanation.
    `;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides related interests based on existing ones. Respond ONLY with a JSON array of strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    // Extract and parse the content
    const content = response.choices[0].message.content?.trim() || "[]";
    
    // Try to parse as JSON, but handle malformed responses
    let parsedInterests;
    try {
      parsedInterests = JSON.parse(content);
      // Ensure it's an array
      if (!Array.isArray(parsedInterests)) {
        parsedInterests = content.split(",").map(i => i.trim());
      }
    } catch (e) {
      // If parsing fails, split by commas
      parsedInterests = content.split(",").map(i => i.trim());
    }

    // Return the response
    return new Response(
      JSON.stringify({ interests: parsedInterests.slice(0, count) }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in expand-interests:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to expand interests",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
} 