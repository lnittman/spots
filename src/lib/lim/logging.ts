import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Log categories for easier filtering
export enum LogCategory {
  SYSTEM = "SYSTEM",
  API = "API",
  LLM = "LLM",
  CACHE = "CACHE",
  USER = "USER",
  PIPELINE = "PIPELINE",
  RECOMMENDATION = "RECOMMENDATION",
  INTEREST = "INTEREST"
}

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  tags: string[];
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
}

// Initialize Redis client if environment variables are available
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Current environment
const environment = process.env.NODE_ENV || 'development';

// Configure minimum log level based on environment
const MIN_LOG_LEVEL = environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;

// Maximum log retention (in days) for different levels
const LOG_RETENTION = {
  [LogLevel.DEBUG]: 3,   // 3 days
  [LogLevel.INFO]: 7,    // 7 days
  [LogLevel.WARN]: 30,   // 30 days
  [LogLevel.ERROR]: 90   // 90 days
};

/**
 * LIM Logger - Comprehensive logging utility for the Large Interest Model pipeline
 */
export class LIMLogger {
  private static instance: LIMLogger;
  private sessionId: string;
  private requestId: string | null = null;
  
  private constructor() {
    this.sessionId = this.generateId();
  }
  
  /**
   * Get the singleton instance of LIMLogger
   */
  public static getInstance(): LIMLogger {
    if (!LIMLogger.instance) {
      LIMLogger.instance = new LIMLogger();
    }
    return LIMLogger.instance;
  }
  
  /**
   * Generate a unique ID for logs
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Set the current request ID
   */
  public setRequestId(requestId: string): void {
    this.requestId = requestId;
  }
  
  /**
   * Create a new request ID and return it
   */
  public createRequestId(): string {
    this.requestId = this.generateId();
    return this.requestId;
  }
  
  /**
   * Log a message with specified level, category, and tags
   */
  public async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    tags: string[] = [],
    userId?: string,
    duration?: number
  ): Promise<void> {
    // Skip if below minimum log level
    if (level < MIN_LOG_LEVEL) return;
    
    const timestamp = new Date().toISOString();
    const logId = this.generateId();
    
    const logEntry: LogEntry = {
      id: logId,
      timestamp,
      level,
      category,
      tags,
      message,
      data,
      userId,
      sessionId: this.sessionId,
      requestId: this.requestId || undefined,
      duration
    };
    
    // Console output with [TAG] format
    const levelStr = LogLevel[level];
    const tagStr = tags.length > 0 ? tags.map(t => `[${t}]`).join(' ') : '';
    console.log(`[${timestamp}] [${levelStr}] [${category}] ${tagStr} ${message}`);
    
    // Store in Redis if available
    if (redis) {
      try {
        // Store the log entry
        const key = `lim:logs:${logId}`;
        await redis.set(key, JSON.stringify(logEntry), {
          ex: LOG_RETENTION[level] * 24 * 60 * 60 // Convert days to seconds
        });
        
        // Add to time-series list for this category and level
        const timeSeriesKey = `lim:logs:${category.toLowerCase()}:${levelStr.toLowerCase()}`;
        await redis.lpush(timeSeriesKey, logId);
        await redis.ltrim(timeSeriesKey, 0, 999); // Keep last 1000 entries
        
        // Add to user's log list if userId is provided
        if (userId) {
          const userLogsKey = `lim:logs:user:${userId}`;
          await redis.lpush(userLogsKey, logId);
          await redis.ltrim(userLogsKey, 0, 99); // Keep last 100 entries per user
        }
      } catch (error) {
        console.error("Failed to store log in Redis:", error);
      }
    }
    
    // For errors, also store in Blob storage for long-term retention if available
    if (level >= LogLevel.ERROR && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobName = `logs/lim/${category.toLowerCase()}/${timestamp.split('T')[0]}/${logId}.json`;
        await put(blobName, JSON.stringify(logEntry, null, 2), {
          access: "public",
          addRandomSuffix: false
        });
      } catch (error) {
        console.error("Failed to store log in Blob storage:", error);
      }
    }
  }
  
  /**
   * Log a debug message
   */
  public debug(category: LogCategory, message: string, data?: any, tags: string[] = [], userId?: string): void {
    this.log(LogLevel.DEBUG, category, message, data, tags, userId);
  }
  
  /**
   * Log an info message
   */
  public info(category: LogCategory, message: string, data?: any, tags: string[] = [], userId?: string): void {
    this.log(LogLevel.INFO, category, message, data, tags, userId);
  }
  
  /**
   * Log a warning message
   */
  public warn(category: LogCategory, message: string, data?: any, tags: string[] = [], userId?: string): void {
    this.log(LogLevel.WARN, category, message, data, tags, userId);
  }
  
  /**
   * Log an error message
   */
  public error(category: LogCategory, message: string, data?: any, tags: string[] = [], userId?: string): void {
    this.log(LogLevel.ERROR, category, message, data, tags, userId);
  }
  
  /**
   * Log the start of a timed operation and return a function to log its completion
   */
  public startTimer(
    category: LogCategory,
    operation: string,
    tags: string[] = [],
    userId?: string
  ): () => Promise<void> {
    const startTime = Date.now();
    this.debug(category, `Starting: ${operation}`, undefined, [...tags, 'START'], userId);
    
    return async () => {
      const duration = Date.now() - startTime;
      await this.info(
        category,
        `Completed: ${operation} (${duration}ms)`,
        undefined,
        [...tags, 'END', 'SUCCESS'],
        userId
      );
    };
  }
  
  /**
   * Log an LLM interaction with detailed information
   */
  public async logLLMInteraction(
    operation: string,
    provider: string,
    model: string,
    prompt: any,
    response: any,
    duration: number,
    success: boolean,
    tags: string[] = [],
    userId?: string
  ): Promise<void> {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const status = success ? 'SUCCESS' : 'FAILED';
    
    await this.log(
      level,
      LogCategory.LLM,
      `${status}: ${operation} with ${provider}/${model} (${duration}ms)`,
      {
        provider,
        model,
        prompt,
        response,
        duration,
        success
      },
      [...tags, 'LLM_INTERACTION', provider.toUpperCase(), model.toUpperCase(), status],
      userId,
      duration
    );
  }
  
  /**
   * Log an API interaction with detailed information
   */
  public async logAPIInteraction(
    endpoint: string,
    method: string,
    requestData: any,
    responseData: any,
    duration: number,
    statusCode: number,
    tags: string[] = [],
    userId?: string
  ): Promise<void> {
    const success = statusCode >= 200 && statusCode < 300;
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const status = success ? 'SUCCESS' : 'FAILED';
    
    await this.log(
      level,
      LogCategory.API,
      `${status}: ${method} ${endpoint} (${statusCode}) (${duration}ms)`,
      {
        endpoint,
        method,
        requestData,
        responseData,
        statusCode,
        duration
      },
      [...tags, 'API_INTERACTION', method.toUpperCase(), `STATUS_${statusCode}`, status],
      userId,
      duration
    );
  }
  
  /**
   * Retrieve logs from Redis by category and level
   */
  public async getLogs(
    category: LogCategory,
    level: LogLevel,
    limit: number = 100
  ): Promise<LogEntry[]> {
    if (!redis) return [];
    
    try {
      const timeSeriesKey = `lim:logs:${category.toLowerCase()}:${LogLevel[level].toLowerCase()}`;
      const logIds = await redis.lrange(timeSeriesKey, 0, limit - 1);
      
      if (!logIds || logIds.length === 0) return [];
      
      const logs: LogEntry[] = [];
      
      for (const logId of logIds) {
        const key = `lim:logs:${logId}`;
        const logData = await redis.get<string>(key);
        
        if (logData) {
          try {
            logs.push(JSON.parse(logData));
          } catch (e) {
            console.error(`Failed to parse log data for ${logId}:`, e);
          }
        }
      }
      
      return logs;
    } catch (error) {
      console.error("Failed to retrieve logs from Redis:", error);
      return [];
    }
  }
  
  /**
   * Retrieve logs for a specific user
   */
  public async getUserLogs(userId: string, limit: number = 100): Promise<LogEntry[]> {
    if (!redis || !userId) return [];
    
    try {
      const userLogsKey = `lim:logs:user:${userId}`;
      const logIds = await redis.lrange(userLogsKey, 0, limit - 1);
      
      if (!logIds || logIds.length === 0) return [];
      
      const logs: LogEntry[] = [];
      
      for (const logId of logIds) {
        const key = `lim:logs:${logId}`;
        const logData = await redis.get<string>(key);
        
        if (logData) {
          try {
            logs.push(JSON.parse(logData));
          } catch (e) {
            console.error(`Failed to parse log data for ${logId}:`, e);
          }
        }
      }
      
      return logs;
    } catch (error) {
      console.error("Failed to retrieve user logs from Redis:", error);
      return [];
    }
  }
} 