import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { LIMLogger, LogCategory } from "@/lib/lim/logging";

/**
 * User registration endpoint
 */
export const dynamic = 'force-dynamic';
export const preferredRegion = 'iad1';

const logger = LIMLogger.getInstance();

// Registration schema validation
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      logger.warn(
        LogCategory.USER,
        'Invalid registration data',
        { errors: result.error.errors },
        ['AUTH', 'REGISTER', 'VALIDATION_ERROR']
      );
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid registration data',
          errors: result.error.errors,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      logger.warn(
        LogCategory.USER,
        'User already exists',
        { email },
        ['AUTH', 'REGISTER', 'USER_EXISTS']
      );
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User with this email already exists',
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    logger.info(
      LogCategory.USER,
      'User registered successfully',
      { userId: user.id, email: user.email },
      ['AUTH', 'REGISTER', 'SUCCESS']
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      'Error registering user',
      { error },
      ['AUTH', 'REGISTER', 'ERROR']
    );
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred during registration',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 