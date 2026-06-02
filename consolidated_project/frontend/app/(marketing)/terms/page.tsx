import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usage Terms — Email Triage",
  description: "Usage terms for Email Triage.",
};

const sections = [
  {
    title: "Service overview",
    body: [
      "Email Triage helps users organize and prioritize email with AI-assisted classification, summaries, and suggested actions.",
      "The service may change over time as features are improved, refined, or removed.",
    ],
  },
  {
    title: "Using the app",
    body: [
      "You may use the app to triage email, connect a Google account, enter agent context, review generated classifications, summaries, and suggested actions, save Gmail drafts, and send replies from the app.",
      "You are responsible for reviewing any AI-generated output before acting on it, saving it as a draft, or sending it. The app may make mistakes, omit context, or classify messages incorrectly.",
    ],
  },
  {
    title: "Google and Gmail access",
    body: [
      "If you connect Gmail, you authorize the app to access the Google account information and Gmail data needed for the triage workflow.",
      "The app may request Gmail permissions to read messages, create drafts, and send email. Drafts are saved and emails are sent only when you choose those actions in the app.",
      "You can revoke access through your Google Account settings. Revoking access may prevent inbox triage, draft saving, and in-app sending from working.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "Do not use the app to process email you are not authorized to access.",
      "Do not attempt to disrupt the service, bypass authentication, extract credentials, or use the app for unlawful, harmful, or abusive purposes.",
      "Do not enter highly sensitive, regulated, or confidential information unless you understand and accept the risks of using an AI-assisted email tool.",
    ],
  },
  {
    title: "AI output",
    body: [
      "The app may generate summaries, priorities, suggested actions, or draft language. These outputs are informational only and should be checked by a person.",
      "If you send a reply through the app, you are responsible for the content, recipients, timing, and consequences of that email.",
      "Email Triage does not provide legal, financial, employment, security, or professional advice.",
    ],
  },
  {
    title: "Ownership",
    body: [
      "The product code, design, and app experience belong to the project team unless otherwise noted.",
      "You retain responsibility for the content you connect, enter, or test with the app.",
    ],
  },
  {
    title: "No warranties",
    body: [
      "The app is provided as-is, without warranties of availability, accuracy, fitness for a particular purpose, or error-free operation.",
      "To the fullest extent permitted by applicable law, the project team is not responsible for losses, missed messages, incorrect classifications, or decisions made based on app output.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these terms should be directed to the project owner responsible for the deployment.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <main className="bg-canvas">
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow text-steel">Legal</p>
        <h1 className="mt-3 text-hero-display text-ink">Usage Terms</h1>
        <p className="mt-5 text-sm text-steel">Last updated: June 1, 2026</p>
        <p className="mt-8 text-[17px] leading-[1.65] text-slate">
          These terms explain how Email Triage may be used, what users are
          responsible for, and how to treat AI-generated output from the app.
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-heading-4 text-ink">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
