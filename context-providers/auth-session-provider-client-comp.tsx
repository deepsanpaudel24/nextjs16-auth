

import { SessionProvider } from "next-auth/react"

export default async function Providers({ children }: { children: React.ReactNode }) {
    
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}