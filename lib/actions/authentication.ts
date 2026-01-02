// app/lib/actions.ts
"use server";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../auth";
import { registerSchema, signInSchema } from "../validation-schemas/zod";
import * as z from "zod";
import { LoginActionState } from "@/types/auth";
import { navroutes } from "@/constants/routes";
import db from "../prisma";
import { saltAndHashPassword } from "../utils";

export async function authenticate(
  prevState: LoginActionState,
  formData: FormData
) {
  try {
    // 1. Convert FormData to a plain JS Object
    const rawEntries = Object.fromEntries(formData);

    // 2. Parse the plain object
    const validatedFields = signInSchema.safeParse(rawEntries);

    if (!validatedFields.success) {
      const error = validatedFields.error;
      const flattenedErrors = z.flattenError(error).fieldErrors;

      return {
        errors: flattenedErrors,
      };
    }
    const { email, password } = validatedFields.data;

    await signIn("credentials", {
      email,
      password,
      redirectTo: navroutes.HOME_URL,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorCode = (error as any).code;
      const errorMessage = error.message;
      switch (errorCode) {
        case "invalid-credentials":
          return { message: errorMessage || "Invalid credentials." };
        case "user-not-found":
          return { message: errorMessage || "User not found" };
        default:
          return { message: "An unexpected authentication error occurred." };
      }
    }
    throw error; // Essential for Next.js redirects to function
  }
}

export const logout = async () => {
  await signOut({ redirectTo: navroutes.LOGIN_URL });
};

type RegisterActionState = {
  error?: string;
  success?: boolean;
};

export async function registerUser(
  _prevState: RegisterActionState,
  values: unknown
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    console.log(parsed.error.issues);
    return { error: "Invalid form data" };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await saltAndHashPassword(password);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: navroutes.HOME_URL,
  });

  return { success: true };
}
