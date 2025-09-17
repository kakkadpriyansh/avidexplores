import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import UserModel, { IUser } from '@/models/User';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Simple User schema for auth
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'USER' },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.models.AuthUser || mongoose.model('AuthUser', userSchema);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'GUIDE';
}

export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret-key'
    ) as any;

    if (!decoded.userId) {
      return null;
    }

    // Get user from database
    await connectDB();
    const user = await (User as Model<IUser>).findById(decoded.userId).lean();

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest) => {
    const user = await verifyToken(request);

    if (!user) {
      return { error: 'Unauthorized', status: 401 };
    }

    if (roles && !roles.includes(user.role)) {
      return { error: 'Forbidden', status: 403 };
    }

    return { user };
  };
}

export function requireAdmin() {
  return requireAuth(['ADMIN']);
}

export function requireAdminOrGuide() {
  return requireAuth(['ADMIN', 'GUIDE']);
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          const user = await (UserModel as Model<IUser>).findOne({
            email: credentials.email.toLowerCase(),
            isActive: true
          }).lean();

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as 'USER' | 'ADMIN' | 'GUIDE',
            image: user.avatar
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [])
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'USER' | 'ADMIN' | 'GUIDE';
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const existingUser = await (UserModel as Model<IUser>).findOne({
            email: user.email?.toLowerCase()
          }).lean();

          if (!existingUser) {
            await (UserModel as Model<IUser>).create({
              name: user.name,
              email: user.email?.toLowerCase(),
              avatar: user.image,
              role: 'USER',
              isActive: true,
              emailVerified: true
            });
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};