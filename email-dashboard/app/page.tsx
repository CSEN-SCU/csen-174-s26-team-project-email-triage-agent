import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">
        Email Triage Agent
      </h1>

      <p className="text-gray-500 text-center max-w-md">
        AI-powered email prioritization and action extraction system
      </p>

      <div className="flex gap-4">
        <Link href="/onboarding">
          <button className="px-4 py-2 bg-black text-white rounded">
            Get Started
          </button>
        </Link>

        <Link href="/inbox">
          <button className="px-4 py-2 border rounded">
            Go to Inbox
          </button>
        </Link>
      </div>
    </div>
  )
}