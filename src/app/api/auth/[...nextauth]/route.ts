import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { LIMLogger, LogCategory } from '@/lib/lim/logging';

const prisma = new PrismaClient();
const logger = LIMLogger.getInstance();

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    logger.error(
      LogCategory.SYSTEM,
      'Error verifying password',
      { error },
      ['AUTH', 'PASSWORD_VERIFICATION']
    );
    return false;
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.warn(
              LogCategory.USER,
              'Missing credentials',
              { email: credentials?.email },
              ['AUTH', 'CREDENTIALS', 'MISSING']
            );
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              accounts: true,
            },
          });

          if (!user || !user.password) {
            logger.warn(
              LogCategory.USER,
              'User not found or no password set',
              { email: credentials.email },
              ['AUTH', 'CREDENTIALS', 'USER_NOT_FOUND']
            );
            return null;
          }

          const isValid = await verifyPassword(credentials.password, user.password);

          if (!isValid) {
            logger.warn(
              LogCategory.USER,
              'Invalid password',
              { email: credentials.email },
              ['AUTH', 'CREDENTIALS', 'INVALID_PASSWORD']
            );
            return null;
          }

          logger.info(
            LogCategory.USER,
            'User authenticated successfully',
            { userId: user.id, email: user.email },
            ['AUTH', 'CREDENTIALS', 'SUCCESS']
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          logger.error(
            LogCategory.SYSTEM,
            'Error authorizing user',
            { error },
            ['AUTH', 'CREDENTIALS', 'ERROR']
          );
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/onboarding',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      logger.info(
        LogCategory.USER,
        'User signed in',
        { userId: user.id, provider: account?.provider, isNewUser },
        ['AUTH', 'SIGN_IN', account?.provider?.toUpperCase() || 'UNKNOWN']
      );
    },
    async signOut({ token }) {
      logger.info(
        LogCategory.USER,
        'User signed out',
        { userId: token.id },
        ['AUTH', 'SIGN_OUT']
      );
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 