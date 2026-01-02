// data/user.ts

import db from "@/lib/prisma";


export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email },
        });

        return user;
    } catch {
        // We return null so the 'authorize' function 
        // can decide which custom error to throw
        return null;
    }
};