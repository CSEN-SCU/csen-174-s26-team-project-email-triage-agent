"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useMemo, useState } from "react"

export default function SignInClient() {
    const params = useSearchParams()
    const callbackUrl = useMemo(() => params.get("callbackUrl") ?? "/inbox", [params])

    const [email, setEmail] = useState("demo@example.com")
    const [password, setPassword] = useState("demo")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            callbackUrl,
        })

        setLoading(false)
        if (!res?.ok) {
            setError("Invalid credentials. Try password: demo")
            return
        }
        window.location.href = res.url ?? callbackUrl
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Sign in</h1>
                    <p className="text-sm text-gray-500">
                        Demo login for now. Use any email and password{" "}
                        <span className="font-medium">demo</span>.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                            placeholder="demo@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                            required
                        />
                    </div>

                    {error ? (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <div className="flex items-center justify-between text-sm">
                    <Link href="/" className="text-gray-600 underline hover:text-black">
                        Back home
                    </Link>
                    <Link href="/inbox" className="text-gray-600 underline hover:text-black">
                        Continue without signing in
                    </Link>
                </div>
            </div>
        </div>
    )
}

