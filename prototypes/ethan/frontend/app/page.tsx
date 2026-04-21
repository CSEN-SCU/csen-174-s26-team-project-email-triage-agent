import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-8">
      
      {/* TITLE */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">
          Email Triage Agent
        </h1>

        <p className="text-gray-600 max-w-xl">
          Stop wasting time sorting emails. Instantly understand what matters,
          what needs action, and what can wait.
        </p>
      </div>

      {/* HOW IT WORKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-6">
        
        <div className="border rounded-xl p-5">
          <h3 className="font-semibold mb-2">1. Analyze</h3>
          <p className="text-sm text-gray-500">
            AI reads your emails and understands intent, urgency, and context.
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h3 className="font-semibold mb-2">2. Prioritize</h3>
          <p className="text-sm text-gray-500">
            Important messages are surfaced first with smart priority scoring.
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h3 className="font-semibold mb-2">3. Act</h3>
          <p className="text-sm text-gray-500">
            Extracted tasks, summaries, and suggested actions help you move fast.
          </p>
        </div>

      </div>

      {/* AI CAPABILITIES */}
      <p className="text-xs text-gray-400 max-w-lg">
        Powered by AI: email summarization • intent detection • priority ranking • action extraction
      </p>

      {/* CTA */}
      <div className="flex gap-4 mt-4">
        <Link href={session ? "/inbox" : "/auth/signin"}>
          <button className="px-6 py-2 bg-black text-white rounded-lg">
            {session ? "Open Smart Inbox" : "Sign in"}
          </button>
        </Link>

        <Link href="/onboarding">
          <button className="px-6 py-2 border rounded-lg">
            See How It Works
          </button>
        </Link>
      </div>

    </div>
  )
}