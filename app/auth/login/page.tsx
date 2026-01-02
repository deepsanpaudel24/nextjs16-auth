

import { signIn } from "@/lib/auth"
import { providerMap } from "@/lib/auth.config"
import LoginForm from "@/components/auth/auth-conponents"
import { navroutes } from "@/constants/routes"



export default async function SignInPage(props: {
    searchParams: Promise<{ callbackUrl?: string }>;
}) {
    const { callbackUrl } = await props.searchParams
    return (
        <div className="flex flex-col gap-2">
            <LoginForm />
            {Object.values(providerMap).map((provider) => (
                <form
                    key={provider.id}
                    action={async () => {
                        "use server"
                            await signIn(provider.id, {
                                redirectTo: callbackUrl ?? navroutes.HOME_URL,
                            })

                       
                    }}
                >
                    <button type="submit">
                        <span>Sign in with {provider.name}</span>
                    </button>
                </form>
            ))}
        </div>
    )
}