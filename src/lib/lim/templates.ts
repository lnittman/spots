import { LogCategory } from "./logging";

/**
 * Template types for different LLM operations
 */
export enum TemplateType {
  INTEREST_GENERATION = "INTEREST_GENERATION",
  RECOMMENDATION_GENERATION = "RECOMMENDATION_GENERATION",
  INTEREST_EXPANSION = "INTEREST_EXPANSION",
  LOCATION_ANALYSIS = "LOCATION_ANALYSIS",
  TREND_DETECTION = "TREND_DETECTION",
  PERSONALIZATION = "PERSONALIZATION",
  CONTENT_ENHANCEMENT = "CONTENT_ENHANCEMENT",
  SEASONAL_ADJUSTMENT = "SEASONAL_ADJUSTMENT"
}

/**
 * Output format types for structured responses
 */
export enum OutputFormat {
  JSON = "JSON",
  MARKDOWN = "MARKDOWN",
  CSV = "CSV",
  XML = "XML",
  YAML = "YAML"
}

/**
 * Template interface for LLM prompts
 */
export interface PromptTemplate {
  id: string;
  type: TemplateType;
  version: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat: OutputFormat;
  outputSchema: any;
  tags: string[];
  category: LogCategory;
  examples?: Array<{
    input: any;
    output: any;
  }>;
  parameters: Array<{
    name: string;
    description: string;
    required: boolean;
    type: string;
  }>;
}

/**
 * Base templates for different LLM operations
 */
export const templates: Record<TemplateType, PromptTemplate> = {
  [TemplateType.INTEREST_GENERATION]: {
    id: "interest-generation-v1",
    type: TemplateType.INTEREST_GENERATION,
    version: "1.0.0",
    description: "Generate relevant interests based on location and user context",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to generate relevant interests for users based on their location, current trends, and seasonal factors. 
    
Your task is to create a list of interests that would be relevant and engaging for users in a specific location. Consider:
1. Local culture and attractions
2. Seasonal activities appropriate for the current time of year
3. Popular trends in the area
4. Diverse range of categories (food, outdoor activities, arts, etc.)

Each interest should include an ID, name, emoji, category, and whether it's trending.`,
    userPromptTemplate: `Generate a list of interests for users in {{location}}. 
    
Current month: {{month}}
Season: {{season}}
Additional context: {{context}}

Return a structured list of interests with the following properties:
- id: A unique identifier (lowercase, hyphenated if multiple words)
- name: Display name for the interest
- emoji: A relevant emoji
- category: The category this interest belongs to
- trending: Boolean indicating if this is currently trending
- color: A hex color code appropriate for this interest (optional)

Focus on interests that would be particularly relevant for {{location}} during {{season}}.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "emoji", "category", "trending"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          emoji: { type: "string" },
          category: { type: "string" },
          trending: { type: "boolean" },
          color: { type: "string" }
        }
      }
    },
    tags: ["INTEREST_GENERATION", "LOCATION_BASED", "SEASONAL"],
    category: LogCategory.INTEREST,
    examples: [
      {
        input: {
          location: "San Francisco",
          month: "June",
          season: "Summer",
          context: "Tech-focused city with diverse food scene"
        },
        output: [
          {
            id: "sourdough-bread",
            name: "Sourdough Bread",
            emoji: "🍞",
            category: "food",
            trending: true,
            color: "#FF6B6B"
          },
          {
            id: "golden-gate-park",
            name: "Golden Gate Park",
            emoji: "🌉",
            category: "outdoors",
            trending: false,
            color: "#4ECDC4"
          }
        ]
      }
    ],
    parameters: [
      {
        name: "location",
        description: "The city or location to generate interests for",
        required: true,
        type: "string"
      },
      {
        name: "month",
        description: "Current month",
        required: true,
        type: "string"
      },
      {
        name: "season",
        description: "Current season",
        required: true,
        type: "string"
      },
      {
        name: "context",
        description: "Additional context about the location or user",
        required: false,
        type: "string"
      }
    ]
  },
  
  [TemplateType.RECOMMENDATION_GENERATION]: {
    id: "recommendation-generation-v1",
    type: TemplateType.RECOMMENDATION_GENERATION,
    version: "1.0.0",
    description: "Generate spot recommendations based on user interests and location",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to generate high-quality spot recommendations based on user interests and location.

Your task is to create detailed, personalized spot recommendations that match the user's specified interests in a particular location. Each recommendation should be specific, actionable, and include rich details that help the user understand why this spot would appeal to them.`,
    userPromptTemplate: `Generate {{count}} spot recommendations in {{location}} for a user interested in {{interests}}.

For each recommendation, provide:
- id: A unique identifier
- name: The name of the spot
- description: A detailed description (2-3 sentences)
- type: The type of spot (cafe, park, museum, etc.)
- address: A plausible address in {{location}}
- coordinates: [latitude, longitude] coordinates
- tags: 3-5 relevant tags
- bestFor: What this spot is best for
- priceLevel: Price level (1-4, where 1 is least expensive)
- rating: Rating (1-5)
- imagePrompt: A detailed prompt that could be used to generate an image of this spot

The recommendations should be diverse but focused on the user's interests. Include both popular spots and hidden gems.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "description", "type", "address", "tags"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          type: { type: "string" },
          address: { type: "string" },
          coordinates: { 
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2
          },
          tags: { 
            type: "array",
            items: { type: "string" }
          },
          bestFor: { type: "string" },
          priceLevel: { type: "integer", minimum: 1, maximum: 4 },
          rating: { type: "number", minimum: 1, maximum: 5 },
          imagePrompt: { type: "string" }
        }
      }
    },
    tags: ["RECOMMENDATION", "LOCATION_BASED", "INTEREST_BASED"],
    category: LogCategory.RECOMMENDATION,
    parameters: [
      {
        name: "location",
        description: "The city or location to generate recommendations for",
        required: true,
        type: "string"
      },
      {
        name: "interests",
        description: "Comma-separated list of user interests",
        required: true,
        type: "string"
      },
      {
        name: "count",
        description: "Number of recommendations to generate",
        required: false,
        type: "number"
      }
    ]
  },
  
  [TemplateType.INTEREST_EXPANSION]: {
    id: "interest-expansion-v1",
    type: TemplateType.INTEREST_EXPANSION,
    version: "1.0.0",
    description: "Expand a given interest into related sub-interests",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to expand interests into more specific sub-interests.

Your task is to take a general interest and expand it into more specific, related sub-interests that users might want to explore. These should be more specific than the parent interest but still related.`,
    userPromptTemplate: `Expand the interest "{{interest}}" into {{count}} more specific sub-interests.

For each sub-interest, provide:
- id: A unique identifier (lowercase, hyphenated if multiple words)
- name: Display name for the sub-interest
- emoji: A relevant emoji
- parentInterest: "{{interest}}"
- description: A brief description of this sub-interest
- popularity: A score from 1-10 indicating how popular this sub-interest is

The sub-interests should be diverse but clearly related to the parent interest "{{interest}}".`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name", "emoji", "parentInterest", "description", "popularity"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          emoji: { type: "string" },
          parentInterest: { type: "string" },
          description: { type: "string" },
          popularity: { type: "integer", minimum: 1, maximum: 10 }
        }
      }
    },
    tags: ["INTEREST_EXPANSION", "TAXONOMY"],
    category: LogCategory.INTEREST,
    parameters: [
      {
        name: "interest",
        description: "The parent interest to expand",
        required: true,
        type: "string"
      },
      {
        name: "count",
        description: "Number of sub-interests to generate",
        required: false,
        type: "number"
      }
    ]
  },
  
  [TemplateType.LOCATION_ANALYSIS]: {
    id: "location-analysis-v1",
    type: TemplateType.LOCATION_ANALYSIS,
    version: "1.0.0",
    description: "Analyze a location for its key characteristics and popular activities",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to analyze locations and identify their key characteristics, popular activities, and unique features.

Your task is to provide a detailed analysis of a specific location, highlighting what makes it unique and what activities or interests are particularly well-suited for this location.`,
    userPromptTemplate: `Analyze {{location}} and provide a detailed breakdown of its key characteristics and popular activities.

Include in your analysis:
- uniqueFeatures: What makes this location special or unique
- popularActivities: Top activities people enjoy here
- bestSeasons: Which seasons are best for visiting and why
- localSpecialties: Food, drinks, or products the area is known for
- culturalHighlights: Important cultural aspects of the location
- hiddenGems: Lesser-known but worthwhile experiences
- demographicAppeal: Which types of visitors this location appeals to most

Focus on specific, actionable insights that would help someone understand what makes {{location}} unique and what they might enjoy doing there.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "object",
      required: ["uniqueFeatures", "popularActivities", "bestSeasons", "localSpecialties", "culturalHighlights", "hiddenGems", "demographicAppeal"],
      properties: {
        uniqueFeatures: { 
          type: "array",
          items: { 
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        popularActivities: { 
          type: "array",
          items: { type: "string" }
        },
        bestSeasons: { 
          type: "object",
          properties: {
            spring: { type: "string" },
            summer: { type: "string" },
            fall: { type: "string" },
            winter: { type: "string" }
          }
        },
        localSpecialties: { 
          type: "array",
          items: { type: "string" }
        },
        culturalHighlights: { 
          type: "array",
          items: { type: "string" }
        },
        hiddenGems: { 
          type: "array",
          items: { type: "string" }
        },
        demographicAppeal: { 
          type: "object",
          properties: {
            families: { type: "string" },
            youngAdults: { type: "string" },
            seniors: { type: "string" },
            soloTravelers: { type: "string" }
          }
        }
      }
    },
    tags: ["LOCATION_ANALYSIS", "TRAVEL"],
    category: LogCategory.INTEREST,
    parameters: [
      {
        name: "location",
        description: "The location to analyze",
        required: true,
        type: "string"
      }
    ]
  },
  
  [TemplateType.TREND_DETECTION]: {
    id: "trend-detection-v1",
    type: TemplateType.TREND_DETECTION,
    version: "1.0.0",
    description: "Detect current trends in interests for a specific location",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to detect current trends in interests and activities for specific locations.

Your task is to identify what interests and activities are currently trending in a given location, based on the current season, recent events, and cultural factors.`,
    userPromptTemplate: `Identify current trending interests and activities in {{location}} for {{season}} {{year}}.

Consider:
- Recent cultural events or phenomena
- Seasonal activities appropriate for {{season}}
- Local festivals or events happening around this time
- Social media trends specific to this location
- New openings or popular destinations

For each trend, provide:
- name: Name of the trending interest/activity
- category: Category it belongs to
- description: Why it's trending right now
- popularityScore: Estimated popularity (1-10)
- demographic: Primary demographic driving this trend
- duration: How long you expect this trend to last ("short", "medium", "long")

Focus on trends that are specific to {{location}} rather than global trends, unless those global trends have a unique local expression.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "category", "description", "popularityScore", "demographic", "duration"],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          popularityScore: { type: "integer", minimum: 1, maximum: 10 },
          demographic: { type: "string" },
          duration: { type: "string", enum: ["short", "medium", "long"] }
        }
      }
    },
    tags: ["TREND_DETECTION", "SEASONAL"],
    category: LogCategory.INTEREST,
    parameters: [
      {
        name: "location",
        description: "The location to detect trends for",
        required: true,
        type: "string"
      },
      {
        name: "season",
        description: "Current season",
        required: true,
        type: "string"
      },
      {
        name: "year",
        description: "Current year",
        required: true,
        type: "string"
      }
    ]
  },
  
  [TemplateType.PERSONALIZATION]: {
    id: "personalization-v1",
    type: TemplateType.PERSONALIZATION,
    version: "1.0.0",
    description: "Personalize recommendations based on user history and preferences",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to personalize recommendations based on user history and preferences.

Your task is to analyze a user's past interactions and preferences to provide highly personalized recommendations that align with their demonstrated interests while also introducing some novel suggestions they might enjoy.`,
    userPromptTemplate: `Personalize recommendations for a user with the following profile:

Explicitly stated interests: {{explicitInterests}}
Past interactions: {{pastInteractions}}
Demographic info: {{demographics}}
Location: {{location}}

Based on this information, provide:
1. A ranked list of interests this user would likely enjoy
2. Specific spot recommendations that match these interests in their location
3. Explanation of why each recommendation matches their profile

Each recommendation should include:
- name: Name of the recommended spot
- interestAlignment: Which of their interests this aligns with
- noveltyFactor: How novel this is compared to their past interactions (1-10)
- personalizedReason: A personalized explanation of why they would enjoy this

Focus on creating a mix of recommendations that reinforce their explicit interests while also introducing some novel options based on patterns in their behavior.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "object",
      required: ["inferredInterests", "recommendations", "personalizationInsights"],
      properties: {
        inferredInterests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              interest: { type: "string" },
              confidenceScore: { type: "number", minimum: 0, maximum: 1 },
              derivedFrom: { type: "string" }
            }
          }
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              interestAlignment: { type: "string" },
              noveltyFactor: { type: "integer", minimum: 1, maximum: 10 },
              personalizedReason: { type: "string" }
            }
          }
        },
        personalizationInsights: {
          type: "object",
          properties: {
            dominantInterestCategory: { type: "string" },
            suggestedNewCategories: { type: "array", items: { type: "string" } },
            personalityInsights: { type: "string" }
          }
        }
      }
    },
    tags: ["PERSONALIZATION", "USER_MODELING"],
    category: LogCategory.RECOMMENDATION,
    parameters: [
      {
        name: "explicitInterests",
        description: "Interests explicitly stated by the user",
        required: true,
        type: "string"
      },
      {
        name: "pastInteractions",
        description: "Description of user's past interactions",
        required: false,
        type: "string"
      },
      {
        name: "demographics",
        description: "Demographic information about the user",
        required: false,
        type: "string"
      },
      {
        name: "location",
        description: "User's current location",
        required: true,
        type: "string"
      }
    ]
  },
  
  [TemplateType.CONTENT_ENHANCEMENT]: {
    id: "content-enhancement-v1",
    type: TemplateType.CONTENT_ENHANCEMENT,
    version: "1.0.0",
    description: "Enhance content about a location or interest with rich details",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to enhance content about locations and interests with rich, accurate details.

Your task is to take basic information about a location or interest and enhance it with engaging, informative content that would help users better understand and appreciate it.`,
    userPromptTemplate: `Enhance the following basic content about {{subject}}:

Basic content:
{{basicContent}}

Enhance this content by adding:
- richDescription: A more detailed and engaging description
- historicalContext: Relevant historical information
- insiderTips: Tips that locals or enthusiasts might know
- bestTimeToVisit: When is the best time to engage with this
- photographyTips: Tips for capturing this subject well
- relatedInterests: Other interests that connect well with this
- funFacts: 3-5 interesting facts about this subject

The enhanced content should be accurate, engaging, and provide genuine value to someone interested in {{subject}}.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "object",
      required: ["richDescription", "historicalContext", "insiderTips", "bestTimeToVisit", "photographyTips", "relatedInterests", "funFacts"],
      properties: {
        richDescription: { type: "string" },
        historicalContext: { type: "string" },
        insiderTips: { 
          type: "array",
          items: { type: "string" }
        },
        bestTimeToVisit: { type: "string" },
        photographyTips: { 
          type: "array",
          items: { type: "string" }
        },
        relatedInterests: { 
          type: "array",
          items: { type: "string" }
        },
        funFacts: { 
          type: "array",
          items: { type: "string" }
        }
      }
    },
    tags: ["CONTENT_ENHANCEMENT", "ENRICHMENT"],
    category: LogCategory.RECOMMENDATION,
    parameters: [
      {
        name: "subject",
        description: "The subject (location or interest) to enhance content for",
        required: true,
        type: "string"
      },
      {
        name: "basicContent",
        description: "The basic content to enhance",
        required: true,
        type: "string"
      }
    ]
  },
  
  [TemplateType.SEASONAL_ADJUSTMENT]: {
    id: "seasonal-adjustment-v1",
    type: TemplateType.SEASONAL_ADJUSTMENT,
    version: "1.0.0",
    description: "Adjust recommendations based on seasonal factors",
    systemPrompt: `You are the Large Interest Model (LIM), a specialized AI designed to adjust recommendations based on seasonal factors.

Your task is to take a set of recommendations and adjust them to be more appropriate for a specific season, taking into account weather, seasonal events, and cultural factors.`,
    userPromptTemplate: `Adjust the following recommendations for {{season}} in {{location}}:

Original recommendations:
{{recommendations}}

For each recommendation, provide:
- id: The original recommendation ID
- seasonalRelevance: Score from 1-10 how relevant this is for {{season}}
- seasonalAdjustments: Specific adjustments to make this more appropriate for {{season}}
- alternativeRecommendation: If the original is not suitable for {{season}}, suggest an alternative
- seasonalEvents: Any seasonal events or factors that enhance this recommendation
- weatherConsiderations: Weather-related considerations for {{season}}

Focus on making these recommendations more seasonally appropriate while preserving the core interest they address.`,
    outputFormat: OutputFormat.JSON,
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "seasonalRelevance", "seasonalAdjustments"],
        properties: {
          id: { type: "string" },
          seasonalRelevance: { type: "integer", minimum: 1, maximum: 10 },
          seasonalAdjustments: { type: "string" },
          alternativeRecommendation: { 
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              reason: { type: "string" }
            }
          },
          seasonalEvents: { 
            type: "array",
            items: { type: "string" }
          },
          weatherConsiderations: { type: "string" }
        }
      }
    },
    tags: ["SEASONAL_ADJUSTMENT", "WEATHER"],
    category: LogCategory.RECOMMENDATION,
    parameters: [
      {
        name: "season",
        description: "The season to adjust recommendations for",
        required: true,
        type: "string"
      },
      {
        name: "location",
        description: "The location of the recommendations",
        required: true,
        type: "string"
      },
      {
        name: "recommendations",
        description: "The original recommendations to adjust",
        required: true,
        type: "string"
      }
    ]
  }
};

/**
 * Fill a template with parameters, providing defaults for missing values
 * @param template The template to fill
 * @param params Parameters to fill the template with
 * @returns The filled template
 */
export function fillTemplate(template: PromptTemplate, params: Record<string, any>): string {
  let prompt = template.userPromptTemplate;
  
  // Extract all parameters from the template using regex
  const paramMatches = prompt.match(/\{\{([^{}]+)\}\}/g) || [];
  const paramNames = paramMatches.map(match => match.substring(2, match.length - 2).trim());
  
  // Fill in parameters
  for (const paramName of paramNames) {
    const value = params[paramName] ?? ''; // Default to empty string if parameter is missing
    prompt = prompt.replace(new RegExp(`\\{\\{${paramName}\\}\\}`, 'g'), value);
  }
  
  return prompt;
}

/**
 * Get a template by type
 * @param type The template type
 * @returns The template
 */
export function getTemplate(type: TemplateType): PromptTemplate {
  const template = templates[type];
  if (!template) {
    throw new Error(`Template not found for type: ${type}`);
  }
  return template;
}

/**
 * Validate that the response matches the expected schema
 * @param response The response to validate
 * @param schema The expected schema
 * @returns Whether the response is valid
 */
export function validateResponse(response: any, schema: any): boolean {
  // This is a simple validation - in production, use a proper JSON schema validator
  try {
    // Check if response is valid JSON
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }
    
    // For now, just check that the response is not null or undefined
    return response !== null && response !== undefined;
  } catch (error) {
    console.error("Failed to validate response:", error);
    return false;
  }
} 