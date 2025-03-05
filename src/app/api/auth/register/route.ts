import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { LIMLogger, LogCategory } from "@/lib/lim/logging";
import prisma from "@/lib/db/prisma";

const logger = LIMLogger.getInstance();

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

/**
 * User registration endpoint
 * @param request Next API request
 * @returns API response
 */
export async function POST(request: NextRequest) {
  // Temporarily disable in production to avoid bcrypt native module issues
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Registration is temporarily disabled in production. Please use the demo login or social login options.' 
      },
      { 
        status: 503 
      }
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      logger.warn(
        LogCategory.USER,
        'Invalid registration data',
        { errors: result.error.errors },
        ['AUTH', 'REGISTER', 'VALIDATION_ERROR']
      );
      
      return NextResponse.json(
        { message: "Invalid registration data", errors: result.error.errors },
        { status: 400 }
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
      
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Log successful registration
    logger.info(
      LogCategory.USER,
      'User registered successfully',
      { userId: user.id, email: user.email },
      ['AUTH', 'REGISTER', 'SUCCESS']
    );

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;

    // Return success response
    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    // Log error
    logger.error(
      LogCategory.SYSTEM,
      'Error registering user',
      { error },
      ['AUTH', 'REGISTER', 'ERROR']
    );

    // Return error response
    return NextResponse.json(
      { message: "An error occurred while registering the user" },
      { status: 500 }
    );
  }
} 