import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Email Triage",
  description: "Privacy practices for Email Triage.",
};

const sections = [
  {
    title: "Overview",
    body: [
      "Email Triage provides an AI-assisted inbox triage workflow for founders and busy operators. This policy explains what information the app may access and how that information is used to provide the service.",
      "This page is provided for transparency and is not legal advice.",
    ],
  },
  {
    title: "Information we access",
    body: [
      "If you connect Gmail, the app may access basic Google account information such as your name, email address, and profile image for sign-in.",
      "The app may read email metadata and message content needed to classify messages into triage buckets, summarize threads, suggest actions, and generate draft replies.",
      "The app may also request permission to create Gmail drafts and send email from your account. Drafts are saved or emails are sent only when you choose the corresponding action in the app.",
      "You may also enter agent context, such as what you are working on, current priorities, customers, pipeline, or other details that help the triage agent make better decisions.",
    ],
  },
  {
    title: "How information is used",
    body: [
      "Information is used to show your inbox, classify messages, summarize relevant threads, suggest actions, generate reply text, save drafts, send replies you approve, and organize results into action-focused buckets.",
      "Agent context is used only to guide triage decisions. For example, it can help the app decide whether an investor email, customer issue, or routine receipt should be prioritized.",
    ],
  },
  {
    title: "Sharing and sale of data",
    body: [
      "We do not sell personal information.",
      "We do not use your email content for advertising. Information may be processed by infrastructure providers and AI services only as needed to operate, secure, and improve the app experience.",
    ],
  },
  {
    title: "Storage and retention",
    body: [
      "The app may store session information, saved agent context, generated draft text, and triage-related data needed for the product to function.",
      "Some triage results may be cached temporarily by the backend so repeated triage runs can return faster. This temporary cache is cleared when your agent context changes or when the backend process restarts.",
      "You can revoke Google access from your Google Account permissions page. You may also request removal of stored account or test data where feasible.",
    ],
  },
  {
    title: "Security",
    body: [
      "Reasonable administrative, technical, and organizational measures are used to protect information handled by the app. No internet service can guarantee perfect security.",
      "Avoid entering highly sensitive, regulated, or confidential information unless you are comfortable with the app's current security posture and access model.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about this policy or to request data deletion, contact the project owner responsible for the deployment.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="bg-canvas">
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow text-steel">Legal</p>
        <h1 className="mt-3 text-hero-display text-ink">Privacy Policy</h1>
        <p className="mt-5 text-sm text-steel">Last updated: June 1, 2026</p>
        <p className="mt-8 text-[17px] leading-[1.65] text-slate">
          This privacy policy describes how Email Triage handles information
          when you use the app, connect Gmail, and provide agent context for
          triage.
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
