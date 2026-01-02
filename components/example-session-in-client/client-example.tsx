"use client"

import { useSession } from "next-auth/react"

import { useState } from "react"


const UpdateForm = () => {
    const { data: session, update } = useSession()
    const [name, setName] = useState(`New ${session?.user?.name}`)

    if (!session?.user) return null
    return (
        <>
            <h2 className="text-xl font-bold">Updating the session client-side</h2>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <input
                    type="text"
                    placeholder="New name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                />
                <button onClick={() => update({ user: { name } })} type="submit">
                    Update
                </button>
            </div>
        </>
    )
}

export default function ClientExample() {
    const { data: session, status } = useSession()
    const [apiResponse, setApiResponse] = useState("")

    const makeRequestWithToken = async () => {
        try {
            const response = await fetch("/api/authenticated/greeting")
            const data = await response.json()
            setApiResponse(JSON.stringify(data, null, 2))
        } catch (error) {
            setApiResponse("Failed to fetch data: " + error)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Client Side Rendering</h1>



            {/* <div className="flex flex-col gap-4 rounded-md bg-gray-100 p-4">
                <h2 className="text-xl font-bold">Third-party backend integration</h2>

                <div className="flex flex-col">
                    <button
                        disabled={!session?.accessToken}//need to pass accesstoken in session from auth.config.ts
                        onClick={makeRequestWithToken}
                    >
                        Make API Request
                    </button>
                </div>
                <pre>{apiResponse}</pre>
                <p className="italic">
                    Note: This example only works when using the Keycloak provider.
                </p>
            </div> */}

            {status === "loading" ? (
                <div>Loading...</div>
            ) : (
                <p>
                    <pre className="text-xs text-gray-300">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </p>
            )}
            <UpdateForm />
        </div>
    )
}