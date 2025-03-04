import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";
import { z } from "zod";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function streamOpenAI({
  prompt,
  systemPrompt = "You are a helpful assistant.",
  temperature = 0.7,
  model = "gpt-4o",
}: {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  model?: string;
}) {
  const response = await openai.chat.completions.create({
    model,
    temperature,
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Create a stream from the OpenAI response
  const stream = OpenAIStream(response);

  // Return a StreamingTextResponse, which is compatible with anything that expects a ReadableStream
  return new StreamingTextResponse(stream);
}

// Schema for structuring AI responses
export const recommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      type: z.string(),
      rating: z.number().min(0).max(5).optional(),
      address: z.string().optional(),
      websiteUrl: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      priceLevel: z.number().min(1).max(4).optional(),
      openHours: z.string().optional(),
      coordinates: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
      tags: z.array(z.string()).optional(),
      matchReason: z.string().optional(),
    })
  ),
  follow_up_questions: z.array(z.string()).optional(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;

// Interest expansion helper
export async function expandInterests(interests: string[]) {
  const prompt = `
    You are an expert at understanding and expanding user interests.
    Given the following list of interests:
    ${interests.join(", ")}
    
    Please expand each interest into related categories and specific aspects that might be relevant for place recommendations.
    For each interest, provide 5-7 related sub-interests or specific aspects.
    Also suggest 3 natural language queries a user might ask to find places related to these interests.
    
    Format your response as a JSON object with:
    1. An "expandedInterests" object with each interest as a key and an array of related sub-interests as values
    2. A "recommendedQueries" array with suggested natural language queries
  `;

  // This would typically call an AI function but we'll return mock data for now
  const mockResponse = {
    expandedInterests: interests.reduce((acc, interest) => {
      acc[interest] = generateMockSubInterests(interest);
      return acc;
    }, {} as Record<string, string[]>),
    recommendedQueries: [
      `Where can I find the best ${interests[0]} spots nearby?`,
      `Recommend some unique places for ${interests.length > 1 ? interests[1] : interests[0]}`,
      `I'm interested in ${interests.join(" and ")}, what places should I visit?`,
    ],
  };

  return mockResponse;
}

// Helper to generate mock sub-interests
function generateMockSubInterests(interest: string): string[] {
  const mockData: Record<string, string[]> = {
    coffee: [
      "specialty coffee",
      "coffee roasting",
      "pour-over coffee",
      "espresso",
      "coffee shops with work space",
      "coffee tasting",
      "outdoor seating coffee shops",
    ],
    hiking: [
      "nature trails",
      "mountain views",
      "waterfall hikes",
      "beginner-friendly trails",
      "challenging hikes",
      "nature photography spots",
      "dog-friendly hiking",
    ],
    photography: [
      "street photography",
      "landscape photography",
      "portrait locations",
      "architecture photography",
      "golden hour spots",
      "photography galleries",
      "photography classes",
    ],
    food: [
      "local cuisine",
      "fine dining",
      "food markets",
      "street food",
      "vegetarian options",
      "ethnic restaurants",
      "culinary classes",
    ],
    art: [
      "museums",
      "art galleries",
      "street art",
      "art studios",
      "art classes",
      "sculpture gardens",
      "art events",
    ],
    music: [
      "live music venues",
      "record shops",
      "music festivals",
      "jazz bars",
      "concert halls",
      "acoustic sets",
      "open mic nights",
    ],
  };

  return mockData[interest.toLowerCase()] || [
    "popular spots",
    "hidden gems",
    "local favorites",
    "top-rated places",
    "unique experiences",
    "must-visit locations",
  ];
} 