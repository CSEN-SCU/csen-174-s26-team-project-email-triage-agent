export default function FormContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-2xl w-full min-h-[450px] mx-auto p-6 flex flex-col space-y-6">
            {children}
        </div>
    )
}