import { Card, CardContent } from "@/components/ui/card"
import { Email } from "@/types/email"
import { Circle } from "lucide-react"

export default function EmailCard({
  email,
  onClick
}: {
  email: Email
  onClick: () => void
}) {
  const priorityColor =
    email.priority === "High"
      ? "text-red-500 fill-red-500"
      : email.priority === "Medium"
      ? "text-yellow-500 fill-yellow-500"
      : "text-green-500 fill-green-500"

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:bg-gray-100 transition ${
        email.priority === "High" ? "border-red-200 bg-red-50/40" : ""
      }`}
    >
      <CardContent className="p-4 space-y-2">
        
        {/* TOP ROW */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className={`h-3 w-3 ${priorityColor}`} />
            <h2 className="font-semibold">{email.subject}</h2>
          </div>

          <span className="text-m text-gray-500">
            {email.priority} Priority
          </span>
        </div>

        {/* SENDER */}
        <p className="text-sm text-gray-700">
          From: {email.sender} ({email.email})
        </p>

        {/* SUMMARY */}
        <p className="text-sm text-gray-500 line-clamp-2">
          {email.summary}
        </p>

      </CardContent>
    </Card>
  )
}