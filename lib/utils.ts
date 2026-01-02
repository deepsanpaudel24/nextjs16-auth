import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import bcrypt from "bcryptjs";

/**
 * Encrypts a password using a salt.
 * Used during User Registration.
 */
export async function saltAndHashPassword(password: string) {
  // 10 is the "salt rounds" - a good balance between security and speed
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Compares a plain text password with a hashed password from the DB.
 * Used during Login (authorize function).
 */
export async function verifyPassword(password: string, hash: string) {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}
