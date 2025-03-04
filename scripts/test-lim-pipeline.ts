#!/usr/bin/env ts-node

/**
 * Spots App - LIM Pipeline Test Script
 * 
 * This script tests the LIM pipeline by making a small test request to both
 * OpenRouter (for Perplexity) and Gemini 2 Flash to verify the integration is working.
 * 
 * Usage:
 *   npx ts-node scripts/test-lim-pipeline.ts
 */

import { LLMClient, LLMProvider } from '../src/lib/lim/llm-client';
import { LIMLogger, LogCategory } from '../src/lib/lim/logging';
import { OutputFormat } from '../src/lib/lim/templates';
// Import dotenv using require since we're in a script context
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize logger and LLM client
// Note: We're assuming that LIMLogger is available and properly implemented
const logger = new LIMLogger();
const llmClient = new LLMClient();

// Define a simple test request
const TEST_LOCATION = 'San Francisco';
const TEST_INTEREST = 'Coffee';

async function testOpenRouterIntegration() {
  logger.info(
    LogCategory.SYSTEM,
    '🧪 Testing OpenRouter/Perplexity Integration',
    { location: TEST_LOCATION, interest: TEST_INTEREST },
    ['TEST', 'OPENROUTER']
  );
  
  try {
    // Create a simplified research prompt
    const researchPrompt = `
      Please provide information about 2 amazing places for ${TEST_INTEREST.toLowerCase()} in ${TEST_LOCATION}.
      Keep it brief - just name and a short description for each.
    `;
    
    // Use OpenRouter to query Perplexity
    const response = await llmClient.processTemplate(
      {
        systemPrompt: `You are a local expert on ${TEST_LOCATION} with knowledge about ${TEST_INTEREST} spots.`,
        userPrompt: researchPrompt,
        outputFormat: { type: "text" } as OutputFormat
      },
      {},
      { 
        provider: LLMProvider.OPENROUTER,
        model: "perplexity/sonar-small-online",
        temperature: 0.3,
        maxTokens: 500,
        tags: ['TEST', 'OPENROUTER']
      }
    );
    
    logger.info(
      LogCategory.SYSTEM,
      '✅ OpenRouter/Perplexity Integration Test Successful',
      { response: typeof response === 'string' ? response.slice(0, 200) + (response.length > 200 ? '...' : '') : response },
      ['TEST', 'OPENROUTER', 'SUCCESS']
    );
    
    return response;
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      '❌ OpenRouter/Perplexity Integration Test Failed',
      { error },
      ['TEST', 'OPENROUTER', 'ERROR']
    );
    throw error;
  }
}

async function testGeminiIntegration(researchResults: string) {
  logger.info(
    LogCategory.SYSTEM,
    '🧪 Testing Gemini 2 Flash Integration',
    { location: TEST_LOCATION, interest: TEST_INTEREST },
    ['TEST', 'GEMINI']
  );
  
  try {
    // Create a simplified enhancement prompt
    const enhancementPrompt = `
      Please analyze the following research about ${TEST_INTEREST.toLowerCase()} places in ${TEST_LOCATION} 
      and structure it into a clean, organized JSON array with 2 items.
      
      RESEARCH DATA:
      ${researchResults}
      
      For each place, include:
      - name: The name of the place
      - description: A concise description
      - priceRange: A number from 1-4 (1 being least expensive)
      
      Return only the valid JSON array with no explanations.
    `;
    
    // Use Gemini to enhance and structure the data
    const response = await llmClient.processTemplate(
      {
        systemPrompt: `You are a helpful assistant that structures data into clean JSON format.`,
        userPrompt: enhancementPrompt,
        outputFormat: { type: "json" } as OutputFormat
      },
      {},
      { 
        provider: LLMProvider.GEMINI,
        model: "gemini-2-flash",
        temperature: 0.7,
        maxTokens: 500,
        tags: ['TEST', 'GEMINI']
      }
    );
    
    logger.info(
      LogCategory.SYSTEM,
      '✅ Gemini 2 Flash Integration Test Successful',
      { response },
      ['TEST', 'GEMINI', 'SUCCESS']
    );
    
    return response;
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      '❌ Gemini 2 Flash Integration Test Failed',
      { error },
      ['TEST', 'GEMINI', 'ERROR']
    );
    throw error;
  }
}

async function runTests() {
  console.log("🧪 Starting LIM Pipeline Integration Tests");
  console.log("------------------------------------------");
  
  try {
    // Test OpenRouter/Perplexity integration
    console.log("Testing OpenRouter/Perplexity integration...");
    const researchResults = await testOpenRouterIntegration();
    console.log("✅ OpenRouter/Perplexity test passed");
    console.log("");
    
    // Test Gemini integration
    console.log("Testing Gemini 2 Flash integration...");
    const enhancedResults = await testGeminiIntegration(researchResults as string);
    console.log("✅ Gemini 2 Flash test passed");
    console.log("");
    
    // Output final results
    console.log("🎉 All tests passed! The LIM pipeline is working correctly.");
    console.log("");
    console.log("Sample Output:");
    console.log(JSON.stringify(enhancedResults, null, 2));
    
    return true;
  } catch (error) {
    console.error("❌ Tests failed:", error);
    return false;
  } finally {
    console.log("------------------------------------------");
  }
}

// Run the tests
runTests().then((success) => {
  process.exit(success ? 0 : 1);
}); 