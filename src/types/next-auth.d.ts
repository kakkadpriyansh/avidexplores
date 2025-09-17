import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN' | 'GUIDE';
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'GUIDE';
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'USER' | 'ADMIN' | 'GUIDE';
  }
}