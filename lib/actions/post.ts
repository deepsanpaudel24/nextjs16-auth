"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await prisma.post.create({
    data: {
      title,
      content,
      userId: "clh6v3r7f0000lqmk6e5z9v5e", // Replace with actual user ID
    },
  });

  revalidatePath("/post");
  redirect("/post");
}
