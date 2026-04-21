export type Bucket = "act_today" | "decide_this_week" | "fyi";

export type Intent =
  | "investor"
  | "customer"
  | "partnership"
  | "recruiting"
  | "vendor"
  | "internal"
  | "cold_outreach"
  | "other";

export interface Email {
  id: string;
  thread_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  received_at: string;
  unread: boolean;
}

export interface TriageSignal {
  intent: Intent;
  priority: number;
  bucket: Bucket;
  reason: string;
}

export interface ActionItem {
  kind: "reply" | "decide" | "schedule" | "delegate" | "archive";
  label: string;
  due_hint?: string | null;
}

export interface TriageResult {
  email_id: string;
  signal: TriageSignal;
  summary: string;
  actions: ActionItem[];
  draft_reply?: string | null;
}

export type Stage = "classify" | "summarize" | "actions" | "draft";

export interface PartialTriageResult {
  email_id: string;
  signal?: TriageSignal;
  summary?: string;
  actions?: ActionItem[];
  draft_reply?: string | null;
  stage?: Stage;
  done?: boolean;
  error?: string;
}

export interface StageEvent {
  email_id: string;
  stage: Stage;
  patch: {
    signal?: TriageSignal;
    summary?: string;
    actions?: ActionItem[];
    draft_reply?: string | null;
  };
}

export interface TriageDigest {
  user_context: string;
  generated_at: string;
  act_today: TriageResult[];
  decide_this_week: TriageResult[];
  fyi: TriageResult[];
}
