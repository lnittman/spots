import { OpenAI } from "openai";
import { z } from "zod";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-token-for-build-process',
});

export async function streamOpenAI({
  prompt,
  context = "",
  system = "",
  temperature = 0.7,
  max_tokens = 1000,
}: {
  prompt: string;
  context?: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    temperature,
    max_tokens,
    messages: [
      {
        role: "system" as const,
        content: system || "You are a helpful assistant for the Spots application. Provide detailed, accurate information to help users find interesting places based on their interests."
      },
      ...(context ? [{ role: "user" as const, content: context }] : []),
      { role: "user" as const, content: prompt }
    ],
  });

  // Create a custom stream response
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    }
  );
}

// Schema for expand interests request
export const expandInterestsSchema = z.object({
  interests: z.array(z.string()),
  location: z.string().optional(),
  count: z.number().optional().default(5),
});

// Schema for recommendation request
export const recommendationSchema = z.object({
  interest: z.string(),
  location: z.string(),
  context: z.string().optional(),
  count: z.number().optional().default(5),
});

// Schema for query request
export const querySchema = z.object({
  query: z.string(),
  context: z.string().optional(),
});

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