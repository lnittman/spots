import { neon } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";

// Direct Neon connection for raw SQL queries
export const sql = neon(process.env.DATABASE_URL || "");

// Initialize Prisma client
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Example function to execute a raw SQL query
 */
export async function executeRawQuery(query: string, params: any[] = []) {
  try {
    // Use tagged template literals for parameterized queries
    return await sql`${query}`;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Example function to get data using raw SQL
 */
export async function getData() {
  try {
    const data = await sql`SELECT * FROM posts LIMIT 10;`;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
} 