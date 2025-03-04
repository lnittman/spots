import { LIMLogger, LogCategory } from "./logging";
import { PromptTemplate, fillTemplate, validateResponse, OutputFormat } from "./templates";

// Supported LLM providers
export enum LLMProvider {
  OPENAI = "openai",
  GEMINI = "gemini",
  ANTHROPIC = "anthropic",
  OPENROUTER = "openrouter"
}

// LLM models by provider
export const LLMModels = {
  [LLMProvider.OPENAI]: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  [LLMProvider.GEMINI]: ["gemini-2-flash", "gemini-1.5-pro", "gemini-1.0-pro"],
  [LLMProvider.ANTHROPIC]: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  [LLMProvider.OPENROUTER]: ["perplexity/sonar-small-online", "anthropic/claude-3-opus", "google/gemini-1.5-pro", "meta-llama/llama-3-70b-instruct"]
};

// Default models by provider
export const DefaultModels = {
  [LLMProvider.OPENAI]: "gpt-4o",
  [LLMProvider.GEMINI]: "gemini-2-flash",
  [LLMProvider.ANTHROPIC]: "claude-3-sonnet",
  [LLMProvider.OPENROUTER]: "perplexity/sonar-small-online"
};

// LLM request options
export interface LLMRequestOptions {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  userId?: string;
  tags?: string[];
}

// Default request options
const DefaultRequestOptions: Partial<LLMRequestOptions> = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0
};

/**
 * LLM Client for interacting with different AI providers
 */
export class LLMClient {
  private logger: LIMLogger;
  private openaiApiKey?: string;
  private geminiApiKey?: string;
  private anthropicApiKey?: string;
  private openrouterApiKey?: string;
  
  constructor() {
    this.logger = LIMLogger.getInstance();
    
    // Load API keys from environment variables
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY;
  }
  
  /**
   * Check if a provider is available (has API key)
   */
  private isProviderAvailable(provider: LLMProvider): boolean {
    switch (provider) {
      case LLMProvider.OPENAI:
        return !!this.openaiApiKey;
      case LLMProvider.GEMINI:
        return !!this.geminiApiKey;
      case LLMProvider.ANTHROPIC:
        return !!this.anthropicApiKey;
      case LLMProvider.OPENROUTER:
        return !!this.openrouterApiKey;
      default:
        return false;
    }
  }
  
  /**
   * Get available providers
   */
  public getAvailableProviders(): LLMProvider[] {
    return Object.values(LLMProvider).filter(provider => this.isProviderAvailable(provider));
  }
  
  /**
   * Get default provider
   */
  public getDefaultProvider(): LLMProvider | null {
    const available = this.getAvailableProviders();
    if (available.length === 0) return null;
    
    // Prefer Gemini > Anthropic > OpenAI
    if (available.includes(LLMProvider.GEMINI)) return LLMProvider.GEMINI;
    if (available.includes(LLMProvider.ANTHROPIC)) return LLMProvider.ANTHROPIC;
    return available[0];
  }
  
  /**
   * Process a template with parameters and send to LLM
   */
  public async processTemplate(
    template: PromptTemplate,
    params: Record<string, any>,
    options: Partial<LLMRequestOptions> = {}
  ): Promise<any> {
    // Merge options with defaults
    const mergedOptions: LLMRequestOptions = {
      ...DefaultRequestOptions,
      ...options,
      provider: options.provider || this.getDefaultProvider() || LLMProvider.OPENAI,
      model: options.model || DefaultModels[options.provider || this.getDefaultProvider() || LLMProvider.OPENAI],
      tags: [...(options.tags || []), ...(template.tags || [])]
    };
    
    // Check if provider is available
    if (!this.isProviderAvailable(mergedOptions.provider)) {
      throw new Error(`Provider ${mergedOptions.provider} is not available`);
    }
    
    // Fill template with parameters
    const userPrompt = fillTemplate(template, params);
    
    // Start timer for logging
    const endTimer = this.logger.startTimer(
      template.category,
      `LLM Request: ${template.type}`,
      [...(mergedOptions.tags || []), 'LLM_REQUEST', mergedOptions.provider.toUpperCase()],
      mergedOptions.userId
    );
    
    try {
      // Send request to LLM
      const startTime = Date.now();
      const response = await this.sendRequest(
        template.systemPrompt,
        userPrompt,
        template.outputFormat,
        mergedOptions
      );
      const duration = Date.now() - startTime;
      
      // Validate response
      const isValid = validateResponse(response, template.outputSchema);
      
      // Log LLM interaction
      await this.logger.logLLMInteraction(
        template.type,
        mergedOptions.provider,
        mergedOptions.model || 'unknown',
        {
          systemPrompt: template.systemPrompt,
          userPrompt,
          params,
          outputFormat: template.outputFormat
        },
        response,
        duration,
        isValid,
        mergedOptions.tags,
        mergedOptions.userId
      );
      
      // End timer
      await endTimer();
      
      if (!isValid) {
        throw new Error(`Invalid response from LLM: ${JSON.stringify(response)}`);
      }
      
      return response;
    } catch (error) {
      // Log error and end timer
      await endTimer();
      throw error;
    }
  }
  
  /**
   * Send a request to the LLM provider
   */
  private async sendRequest(
    systemPrompt: string,
    userPrompt: string,
    outputFormat: OutputFormat,
    options: LLMRequestOptions
  ): Promise<any> {
    const provider = options.provider;
    
    // Add format instructions to system prompt if outputFormat is specified
    const systemPromptWithFormat = outputFormat 
      ? `${systemPrompt}\n\n${this.getFormatInstructions(outputFormat)}`
      : systemPrompt;
    
    this.logger.debug(
      LogCategory.LLM,
      `Sending request to ${provider}`,
      { provider, model: options.model, systemPrompt: systemPromptWithFormat.slice(0, 100) + "...", userPrompt: userPrompt.slice(0, 100) + "..." },
      ['REQUEST'],
      options.userId
    );
    
    // Route to appropriate provider
    switch (provider) {
      case LLMProvider.OPENAI:
        return this.sendOpenAIRequest(systemPromptWithFormat, userPrompt, options);
      case LLMProvider.GEMINI:
        return this.sendGeminiRequest(systemPromptWithFormat, userPrompt, options);
      case LLMProvider.ANTHROPIC:
        return this.sendAnthropicRequest(systemPromptWithFormat, userPrompt, options);
      case LLMProvider.OPENROUTER:
        return this.sendOpenRouterRequest(systemPromptWithFormat, userPrompt, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  /**
   * Get format instructions based on output format
   */
  private getFormatInstructions(format: OutputFormat): string {
    switch (format) {
      case OutputFormat.JSON:
        return "IMPORTANT: Your response must be valid JSON without any additional text, explanations, or markdown formatting. Do not include ```json or ``` markers.";
      case OutputFormat.MARKDOWN:
        return "IMPORTANT: Your response must be formatted in Markdown.";
      case OutputFormat.CSV:
        return "IMPORTANT: Your response must be in CSV format without any additional text or explanations.";
      case OutputFormat.XML:
        return "IMPORTANT: Your response must be valid XML without any additional text or explanations.";
      case OutputFormat.YAML:
        return "IMPORTANT: Your response must be valid YAML without any additional text or explanations.";
      default:
        return "";
    }
  }
  
  /**
   * Send a request to OpenAI
   */
  private async sendOpenAIRequest(
    systemPrompt: string,
    userPrompt: string,
    options: LLMRequestOptions
  ): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: options.model || DefaultModels[LLMProvider.OPENAI],
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      // Parse JSON if the output format is JSON
      if (content) {
        try {
          return JSON.parse(content);
        } catch (e) {
          return content;
        }
      }
      
      return content;
    } catch (error) {
      this.logger.error(
        LogCategory.LLM,
        `OpenAI API error: ${error}`,
        { error, systemPrompt, userPrompt },
        ['OPENAI', 'API_ERROR'],
        options.userId
      );
      throw error;
    }
  }
  
  /**
   * Send a request to Gemini
   */
  private async sendGeminiRequest(
    systemPrompt: string,
    userPrompt: string,
    options: LLMRequestOptions
  ): Promise<any> {
    if (!this.geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }
    
    try {
      const model = options.model || DefaultModels[LLMProvider.GEMINI];
      const apiVersion = model.includes("gemini-2") ? "v1" : "v1beta";
      
      const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${systemPrompt}\n\n${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
            topP: options.topP
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // Parse JSON if the output format is JSON
      if (content) {
        try {
          return JSON.parse(content);
        } catch (e) {
          return content;
        }
      }
      
      return content;
    } catch (error) {
      this.logger.error(
        LogCategory.LLM,
        `Gemini API error: ${error}`,
        { error, systemPrompt, userPrompt },
        ['GEMINI', 'API_ERROR'],
        options.userId
      );
      throw error;
    }
  }
  
  /**
   * Send a request to Anthropic
   */
  private async sendAnthropicRequest(
    systemPrompt: string,
    userPrompt: string,
    options: LLMRequestOptions
  ): Promise<any> {
    if (!this.anthropicApiKey) {
      throw new Error("Anthropic API key not configured");
    }
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.anthropicApiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: options.model || DefaultModels[LLMProvider.ANTHROPIC],
          system: systemPrompt,
          messages: [
            { role: "user", content: userPrompt }
          ],
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${response.status} ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      const content = data.content?.[0]?.text;
      
      // Parse JSON if the output format is JSON
      if (content) {
        try {
          return JSON.parse(content);
        } catch (e) {
          return content;
        }
      }
      
      return content;
    } catch (error) {
      this.logger.error(
        LogCategory.LLM,
        `Anthropic API error: ${error}`,
        { error, systemPrompt, userPrompt },
        ['ANTHROPIC', 'API_ERROR'],
        options.userId
      );
      throw error;
    }
  }

  /**
   * Send a request to OpenRouter
   */
  private async sendOpenRouterRequest(
    systemPrompt: string,
    userPrompt: string,
    options: LLMRequestOptions
  ): Promise<any> {
    if (!this.openrouterApiKey) {
      throw new Error("OpenRouter API key not configured");
    }
    
    try {
      const model = options.model || DefaultModels[LLMProvider.OPENROUTER];
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.openrouterApiKey}`,
          "HTTP-Referer": process.env.APP_URL || "https://spots.app",
          "X-Title": "Spots App"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Parse JSON if the output format is JSON
      if (content) {
        try {
          return JSON.parse(content);
        } catch (e) {
          return content;
        }
      }
      
      return content;
    } catch (error) {
      this.logger.error(
        LogCategory.LLM,
        `OpenRouter API error: ${error}`,
        { error, systemPrompt, userPrompt },
        ['OPENROUTER', 'API_ERROR'],
        options.userId
      );
      throw error;
    }
  }
} 