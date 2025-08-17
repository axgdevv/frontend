export interface ChecklistItem {
  category: string;
  item: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface ChecklistResponse {
  _id: string;
  user_id: string;
  project_id: string;
  title: string;
  checklist_items: ChecklistItem[];
  checklist_item_count: number;
  relevant_comments_count: number;
  summary_of_key_concerns: string;
  suggested_next_steps: string[];
  created_at: string; // ISO string
  updated_at: string; // ISO string
}
