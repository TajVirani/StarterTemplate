import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../../lib/prisma';
import NextAuth from 'next-auth';
import { AppProviders } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PBKDF2 } from 'crypto-js';

const { NODE_ENV, SECRET = '' } = process.env;
const providers: AppProviders = [];

if (NODE_ENV === 'test') {
  providers.push(
    CredentialsProvider({
      id: 'github',
      name: 'Mocked GitHub',
      async authorize(credentials) {
        const user = {
          id: credentials?.name,
          name: credentials?.name,
          email: credentials?.name,
          image: '/assets/user-robot.png',
        };
        return user;
      },
      credentials: {
        name: { type: 'test', placeholder: 'Jane Doe' },
      },
      type: 'credentials',
    }),
  );
} else {
  providers.push(
    CredentialsProvider({
      id: 'generic-auth',
      name: 'Username and Password',
      async authorize(credentials) {
        if (credentials?.name && credentials?.password && credentials.email) {
          const hashedPassword = PBKDF2(credentials.password, SECRET, {
            keySize: 128 / 32,
          }).toString();
          console.log({ password: credentials?.password, hashedPassword });

          const user = await prisma.user.upsert({
            where: {
              email: credentials.email,
            },
            update: {
              name: credentials.name,
            },
            create: {
              email: credentials.email,
              status: 'ACTIVE',
              name: credentials.name,
              image: '/assets/user-robot.png',
              password: hashedPassword,
            },
          });

          const passwordMatch = hashedPassword === user.password;
          if (passwordMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              status: user.status,
            };
          }
        }
        return null;
      },
      credentials: {
        email: { type: 'email', placeholder: 'jdoe@domain.com' },
        name: { type: 'text', placeholder: 'Jane Doe' },
        password: { type: 'password', placeholder: 'Password' },
      },
      type: 'credentials',
    }),
  );
}

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 3000,
  },
  secret: process.env.SECRET,
});
