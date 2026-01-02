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
        authorId: 1,
      },
    });

    revalidatePath("/post");
    redirect("/post");
  }