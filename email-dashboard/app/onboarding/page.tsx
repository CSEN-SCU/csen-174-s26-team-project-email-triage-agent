"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormContainer from "@/components/formcontainer"

export default function Onboarding() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const STEPS = 4

    const [formData, setFormData] = useState({
        businessType: "",
        industry: "",
        emailTypes: "",
        keywords: ""
    })

    const next = () => setStep((s) => Math.min(s + 1, STEPS))
    const back = () => setStep((s) => Math.max(s - 1, 1))

    const isStepValid = () => {
        if (step === 1) return formData.businessType && formData.industry
        if (step === 2) return formData.emailTypes
        if (step === 3) return formData.keywords
        return true
    }

    // A reusable input style for consistent sizing
    const inputClass = "border w-full text-lg p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-black"

    return (
        <FormContainer>
            <h1 className="text-2xl font-bold">Onboarding</h1>
            {/* Progress */}
            <div className="space-y-2">
                <div className="text-sm text-gray-500">Step {step} of {STEPS}</div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div
                        className="h-3 bg-black rounded-full transition-all duration-300"
                        style={{ width: `${(step / STEPS) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col flex-1 justify-between">
                {/* Steps */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Business Info</h2>
                        <input
                            className={inputClass}
                            placeholder="Business type"
                            value={formData.businessType}
                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        />
                        <input
                            className={inputClass}
                            placeholder="Industry"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Email Types</h2>
                        <input
                            className={inputClass}
                            placeholder="Client emails, vendors, etc."
                            value={formData.emailTypes}
                            onChange={(e) => setFormData({ ...formData, emailTypes: e.target.value })}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Priority Rules</h2>
                        <input
                            className={inputClass}
                            placeholder="Keywords like urgent, deadline..."
                            value={formData.keywords}
                            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        />
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Review</h2>
                        <p className="text-gray-500">Review your settings before entering the inbox.</p>
                        <ul className="list-disc list-inside">
                            <li>Business: {formData.businessType}</li>
                            <li>Industry: {formData.industry}</li>
                            <li>Email Types: {formData.emailTypes}</li>
                            <li>Keywords: {formData.keywords}</li>
                        </ul>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    <button
                        onClick={back}
                        disabled={step === 1}
                        className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={next}
                            disabled={!isStepValid()}
                            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push("/inbox")}
                            className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                            Enter Inbox
                        </button>
                    )}
                </div>
            </div>
        </FormContainer>
    )
}