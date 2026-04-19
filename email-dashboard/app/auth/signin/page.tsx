import { Suspense } from "react"
import SignInClient from "./SignInClient"

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <SignInClient />
        </Suspense>
    )
}

