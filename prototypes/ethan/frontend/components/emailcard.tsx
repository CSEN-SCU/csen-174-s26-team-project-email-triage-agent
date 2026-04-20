import { Card, CardContent } from "@/components/ui/card"
import { Email } from "@/types/email"

export default function EmailCard({
  email,
  onClick
}: {
  email: Email
  onClick: () => void
}) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:bg-gray-100">
      <CardContent className="p-4">
        <h2 className="font-semibold">{email.subject}</h2>
        <p className="text-sm">
          From: {email.sender} ({email.email})
        </p>
        <p className="text-sm text-gray-500">
          {email.summary}
        </p>
      </CardContent>
    </Card>
  )
}