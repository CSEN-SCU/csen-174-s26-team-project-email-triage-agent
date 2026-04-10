export type Email = {
    id: string
    subject: string
    sender: string
    email: string
    summary: string
    priority: "High" | "Medium" | "Low"
    actions: string[]
    meetings: string[]
}