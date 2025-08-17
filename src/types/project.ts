export interface ProjectResponse {
  _id: string;
  project_name: string;
  client_name?: string; // optional since some projects may not have a client
  project_type: string;
  state: string; // consider making this a union of state codes if you want stronger typing
  city: string;
  user_id: string;
  checklist_count: number;
  qa_count: number;
  created_at: string; // ISO string (use Date if your API sends it as a JS date)
  domain: "structural" | "architectural" | "mechanical" | "electrical" | string; // extend as needed
  status: "in_progress" | "completed" | "under_review" | "cancelled";
}

export type ProjectStatus =
  | "in_progress"
  | "completed"
  | "under_review"
  | "cancelled";
