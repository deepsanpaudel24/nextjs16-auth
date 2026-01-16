"use client"

import { useSession } from "next-auth/react";

export default  function Preferences() {
 const { data: session , status} = useSession()
 
  
 

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <p>This is the current status of session {status}</p>
        
      </main>
    </div>
  );
}
