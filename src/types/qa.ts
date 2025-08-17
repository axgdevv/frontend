export interface QAItem {
  category: string;
  item: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  reference: string;
  confidence: string;
}

export interface QAResponse {
  _id: string;
  title: string;
  project_id: string;
  user_id: string;
  items: QAItem[];
  qa_item_count: number;
  created_at: string;
  updated_at: string;
}
