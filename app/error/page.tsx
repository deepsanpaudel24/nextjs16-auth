"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { navroutes } from "@/constants/routes"

// 1. Define all Auth.js standard error codes
enum AuthErrorType {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Default = "Default",
}

// 2. Map codes to user-friendly messages
const errorMap: Record<AuthErrorType, React.ReactNode> = {
  [AuthErrorType.Configuration]: (
    <p>There is a problem with the server configuration. Please check your authentication options.</p>
  ),
  [AuthErrorType.AccessDenied]: (
    <p>Access was denied. You may not have permission to view this content.</p>
  ),
  [AuthErrorType.Verification]: (
    <p>The verification token has expired or has already been used.</p>
  ),
  
  [AuthErrorType.Default]: (
    <p>An unexpected authentication error occurred.</p>
  ),
}

function ErrorContent() {
  const search = useSearchParams()
  const error = search.get("error") as AuthErrorType

  const errorMessage = errorMap[error] || errorMap[AuthErrorType.Default]

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow dark:border-gray-700 dark:bg-gray-800">
        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Something went wrong
        </h5>
        
        <div className="mb-4 font-normal text-gray-700 dark:text-gray-400">
          {errorMessage}
        </div>

        {/* Display the raw error code for debugging */}
        <p className="mb-6 text-xs text-gray-400 uppercase tracking-widest">
          Error Code: <code className="bg-slate-100 dark:bg-slate-700 p-1 rounded">{error || "Unknown"}</code>
        </p>

        <Link
          href={navroutes.LOGIN_URL}
          className="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <div className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow dark:border-gray-700 dark:bg-gray-800">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Loading...
          </h5>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}