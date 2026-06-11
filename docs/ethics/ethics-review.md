# Ethics Reflection

## Product Vision

**POWERED BY** an Antigravity multi-agent runtime, decentralized intent classification, priority scoring, semantic summarization, automated draft generation, and Google / Gmail API integration

## Stakeholders

**User:** Entrepreneurs and solo technical founders use Email Triage Agent to reduce inbox overload and decide which messages need action today, which need a decision this week, and which can safely wait.

**Non-user:** Email senders such as investors, customers, partners, vendors, and employees are affected because their messages may be read, summarized, scored, and deprioritized by the system even though they are not directly using the product or consenting inside the app.

## Potential Harms

### Harm 1: Private email content may be exposed or over-collected

**Harm:** Users and non-user email senders can be harmed if private inbox content, business plans, customer information, investor updates, contracts, or personal details are accessed or stored more broadly than needed for triage.

**Principle:** IEEE/ACM SE Code 2.05, "Keep private any confidential information gained in professional work," and 1.03, "Approve software only if it does not diminish privacy."

**Mitigation:** The team uses Google OAuth with a read-only Gmail scope for the current workflow and routes Gmail access through explicit user connection gates rather than silently reading a mailbox. The UI and documentation state that Gmail access is read-only, and the app falls back to a seeded mock inbox when no token is present. Before demo night, the team should avoid entering real sensitive inbox data unless needed and verify that no API keys, tokens, or private email samples are committed.

### Harm 2: Incorrect prioritization may cause missed obligations

**Harm:** A founder can be harmed if the agent incorrectly puts an urgent investor, customer, or legal message into a lower-priority bucket, causing a missed deadline, damaged relationship, or delayed response.

**Principle:** IEEE/ACM SE Code 3.10, "Ensure adequate testing, debugging, and review," and 6.07, "Be accurate in stating the characteristics of software."

**Mitigation:** The app keeps triage results visible as suggestions rather than automatically archiving or deleting messages, and the bucket UI shows reasons, priorities, summaries, and suggested actions so users can review the agent's judgment. The team also uses a seeded inbox and tests around classification and streaming behavior. Before demo night, the team should describe outputs as AI-assisted recommendations, not guaranteed decisions, and avoid claiming the system catches every urgent message.

### Harm 3: The system may reinforce the user's blind spots

**Harm:** Because the agent uses the user's written context to decide what matters, it may amplify a founder's existing assumptions and consistently deprioritize messages from people or opportunities not mentioned in that context, such as small customers, cold outreach from underrepresented founders, recruiting candidates, or operational vendors.

**Principle:** IEEE/ACM SE Code 3.03, "Identify, define, and address ethical, economic, cultural, legal, and environmental issues related to work projects," and 1.02, "Moderate the interests of the software engineer, employer, client, and users with the public good."

**Mitigation:** The context field is editable and visible, making it clear that the agent's decisions depend on what the user tells it. The team added an Autofill baseline to give users a reasonable starting context instead of forcing them to invent one from scratch. The team should continue to label buckets as decision aids, keep lower-priority messages accessible, and consider tests or examples that ensure customer issues and safety-critical operational messages are not ignored merely because they are not revenue-related.

## One Concrete Change

The team kept Gmail OAuth limited to read-only access for the current triage workflow and placed the Gmail connection behind an explicit user action, because the app should only request the permissions needed for the features that are available now. The team will also request additional Gmail permission separately and make the user confirm before any AI-generated draft is sent from the app.

The team also added public Privacy Policy and Usage Terms pages so users can understand what data the app may access, how AI-generated outputs should be treated, and what responsibilities remain with the user before they connect an inbox.

