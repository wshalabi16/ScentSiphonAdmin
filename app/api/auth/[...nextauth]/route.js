import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import { adminEmails } from '@/lib/adminEmails';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user }) {
      // Check if user email is in admin list
      if (adminEmails.includes(user?.email)) {
        return true;  // Allow sign in
      }
      // Reject sign in - this prevents session creation
      return false;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };