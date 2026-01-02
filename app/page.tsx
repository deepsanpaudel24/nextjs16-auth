import { SignOut } from "@/components/auth/auth-conponents";
import Image from "next/image";
import { auth } from "@/lib/auth";
import db from "@/lib/prisma";

export default async function Home() {
  const session = await auth();

  let user=null;
  if (session) {
    user = await db.user.findUnique({
      where: {
        id: session.user?.id,
      }
    });
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="bg-neutral-800 rounded-lg p-6 max-w-xl w-full">
          <h1 className="text-white text-xl mb-4 text-center">Auth.js + Prisma</h1>


          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300">Signed in as:</p>
              <p className="text-white">{session?.user?.email}</p>
            </div>

            <div className="text-center">
              <p className="text-gray-300">Data fetched from DB with Prisma:</p>
            </div>
            <div className="bg-neutral-900 rounded p-3">
              <pre className="text-xs text-gray-300">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            {
              session && <div className="text-center">
                <SignOut />
              </div>
            }

          </div>

        </div>

      </main>
    </div>
  );
}
