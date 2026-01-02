'use client'
import { authenticate, logout } from "@/lib/actions/authentication";
import { useActionState } from "react";


export default function LoginForm() {
    // errorMessage will hold the string returned from our action
    const [state, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
    <form action={formAction} className="space-y-4">
      <div>
        <input name="email" type="email" placeholder="Email" className="border p-2 w-full" />
        {/* Render Email Error */}
        {state?.errors?.email && (
          <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <input name="password" type="password" placeholder="Password" className="border p-2 w-full" />
        {/* Render Password Error */}
        {state?.errors?.password && (
          <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Render General Auth Error (User not found, etc) */}
      {state?.message && <p className="text-red-600 bg-red-100 p-2">{state.message}</p>}

      <button disabled={isPending} className="bg-blue-500 text-white p-2">
        {isPending ? "Loading..." : "Login"}
      </button>
    </form>
  );
}

export function SignOut() {
    return (
        <form
            action={logout}
            className="w-full"
        >
            <button className="bg-neutral-700 text-white p-2 rounded-md">
                Sign Out
            </button>
        </form>
    )
}