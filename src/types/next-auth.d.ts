import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN' | 'SUB_ADMIN' | 'GUIDE';
      permissions?: string[];
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'SUB_ADMIN' | 'GUIDE';
    permissions?: string[];
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'USER' | 'ADMIN' | 'SUB_ADMIN' | 'GUIDE';
    permissions?: string[];
  }
}