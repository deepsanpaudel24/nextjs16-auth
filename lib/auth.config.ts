import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";

import { signInSchema } from "./validation-schemas/zod";
import { getUserByEmail } from "@/dbqueries/user";

import db from "./prisma";

import { navroutes } from "@/constants/routes";
import { verifyPassword } from "./utils";

class InvalidLoginError extends CredentialsSignin {
  code = "invalid-credentials";
  constructor(message?: any) {
    super(message);
    this.message = message;
  }
}

class UserNotFoundError extends CredentialsSignin {
  code = "user-not-found";
  constructor(message?: any) {
    super(message);
    this.message = message;
  }
}

// class UserNotVerifiedError extends CredentialsSignin {
//     code = 'user-not-verified';
// }

// class UserDeactivatedError extends CredentialsSignin {
//     code = 'user-deactivated';
// }

const providers: Provider[] = [
  Credentials({
    id: "credentials", // Standard username/password login
    name: "Credentials",
    credentials: {
      email: { type: "email" },
      password: { type: "password" },
    },
    authorize: async (c) => {
      // returning null, This will be caught as a 'CredentialsSignin' in the action
      let user = null;
      // 1. Quick validation
      const validatedFields = signInSchema.safeParse(c);

      // 2. If it fails here, just return null.
      // The user already saw the specific Zod messages from the Server Action.
      if (!validatedFields.success) return null;

      const { email, password } = validatedFields.data;

      user = await getUserByEmail(email);
      if (!user) {
        throw new UserNotFoundError("User not found !");
      }

      // logic to salt and hash password
      const isMatch = verifyPassword(password, user.password!);
      if (!isMatch) {
        throw new InvalidLoginError("Email or Password invalid.");
      }

      return user;
    },
  }),
  GitHub,
  Google,
  //   Google({
  //     allowDangerousEmailAccountLinking: true, //this is for automatic account linking for google (fix for: oAuthaccountnotlinked)
  //   }),
  //   GitHub({
  //     allowDangerousEmailAccountLinking: true, //this is for automatic account linking for github (fix for: oAuthaccountnotlinked)
  //   }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export default {
  providers,
  session: { strategy: "jwt" },

  pages: {
    signIn: navroutes.LOGIN_URL,
    error: navroutes.SIGNIN_ERROR_URL,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email_verified) {
        //you can do like this for github also
        user.emailVerified = new Date(); // Update the user object , so it create user in db and have emailverifed value instead of null
      }
      // console.log({ profile });
      //can access {profile, email } also
      if (!account) return true;

      // Check if user is already signed in (linking scenario)
      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
        include: { accounts: true },
      });

      if (!existingUser) {
        return true; // New user, create normally
      }

      // Check if this OAuth account is already linked
      const accountExists = existingUser.accounts.some(
        (acc) =>
          acc.provider === account.provider &&
          acc.providerAccountId === account.providerAccountId
      );

      if (accountExists) {
        return true; // Already linked, allow sign in
      }
      //doing manual linking by account creating. (or you can do automatic linking by using allowDangerousEmailAccountLinking)
      await db.account.create({
        data: {
          userId: existingUser.id,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state
            ? (account.session_state as string)
            : undefined,
        },
      });

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // console.log({ account });
      //can access { user } also
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser?.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      //can access { token } also
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

// Great question! Let me break down the exact sequence of when Users and Accounts are created, and when the error occurs.
// The Database Tables
// Auth.js uses two main tables:

// User table - Stores user information (id, email, name, etc.)
// Account table - Stores OAuth provider connections (userId, provider, providerAccountId, etc.)

// Scenario 1: First Time OAuth Sign-In (No Error)

// Step 1: User clicks "Sign in with Google"
// Step 2: OAuth flow completes, Auth.js receives profile data
// Step 3: Auth.js checks: Does user with this email exist?
//         → NO user found

// Step 4: CREATE USER
//         INSERT INTO User (email, name, image)
//         VALUES ('user@example.com', 'John Doe', '...')

// Step 5: CREATE ACCOUNT (links OAuth to user)
//         INSERT INTO Account (userId, provider, providerAccountId, ...)
//         VALUES (newUserId, 'google', 'google-id-123', ...)

// Step 6: ✅ Sign in successful
// Result: User table has 1 entry, Account table has 1 entry

// Scenario 2: OAuth After Credentials Sign-Up (ERROR!)
// Step 1: User previously signed up with email/password
//         User table: { id: 1, email: 'user@example.com' }
//         Account table: (empty - no OAuth yet)

// Step 2: User clicks "Sign in with Google" (same email)
// Step 3: OAuth flow completes
// Step 4: Auth.js checks: Does user with this email exist?
//         → YES! User found with id: 1

// Step 5: Auth.js checks: Is there an Account linking this user to Google?
//         SELECT * FROM Account
//         WHERE userId = 1 AND provider = 'google'
//         → NO account found

// Step 6: ❌ ERROR: OAuthAccountNotLinked
//         (Auth.js STOPS here - no User or Account created)

// Step 7: User redirected to error page
// Why the error? Auth.js found a user with that email but no Account record linking that user to the OAuth provider. It refuses to auto-link for security reasons.

// Scenario 3: With allowDangerousEmailAccountLinking: true
// Step 1: User previously signed up with email/password
//         User table: { id: 1, email: 'user@example.com' }
//         Account table: (empty)

// Step 2: User clicks "Sign in with Google" (same email)
// Step 3: OAuth flow completes
// Step 4: Auth.js checks: Does user with this email exist?
//         → YES! User found with id: 1

// Step 5: Auth.js checks allowDangerousEmailAccountLinking
//         → TRUE, so proceed with linking

// Step 6: CREATE ACCOUNT (NO new user created)
//         INSERT INTO Account (userId, provider, providerAccountId, ...)
//         VALUES (1, 'google', 'google-id-123', ...)

// Step 7: ✅ Sign in successful
