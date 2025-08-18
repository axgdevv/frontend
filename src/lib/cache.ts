import React from "react";

// Project location stats
interface ProjectLocation {
  location: string;
  city: string;
  state: string;
  count: number;
}

// Issue category stats
interface IssueCategory {
  category: string;
  count: number;
  high_priority_count: number;
  percentage: number;
}

// Monthly projects data
interface MonthlyData {
  month: string;
  count: number;
}

// Overall dashboard stats
interface DashboardStats {
  total_projects_this_month: number;
  active_projects_this_month: number;
  completed_projects: number;
  projects_by_location: ProjectLocation[];
  top_issue_categories: IssueCategory[];
  monthly_completed_projects: MonthlyData[];
}

type ProjectStatus = "in_progress" | "completed" | "under_review" | "cancelled";

interface ProjectResponse {
  _id: string;
  project_name: string;
  client_name?: string;
  project_type: string;
  state: string;
  city: string;
  user_id: string;
  checklist_count: number;
  qa_count: number;
  created_at: string;
  domain: "structural" | "architectural" | "mechanical" | "electrical" | string;
  status: ProjectStatus;
}

interface ProjectsData {
  projects: ProjectResponse[];
  totalPages: number;
  totalProjects: number;
}

interface ChecklistItem {
  category: string;
  item: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

interface ChecklistResponse {
  _id: string;
  user_id: string;
  project_id: string;
  title: string;
  checklist_items: ChecklistItem[];
  checklist_item_count: number;
  relevant_comments_count: number;
  summary_of_key_concerns: string;
  suggested_next_steps: string[];
  created_at: string;
  updated_at: string;
}

interface QAItem {
  category: string;
  item: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  reference: string;
  confidence: string;
}

interface QAResponse {
  _id: string;
  title: string;
  project_id: string;
  user_id: string;
  items: QAItem[];
  qa_item_count: number;
  created_at: string;
  updated_at: string;
}

interface PaginatedChecklistData {
  checklists: ChecklistResponse[];
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  total_checklists: number;
}

interface PaginatedQAData {
  qas: QAResponse[];
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  total_qas: number;
}

// utils/cache.ts
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  dependencies?: string[];
};

type CacheKey =
  | `dashboard:${string}`
  | `projects:${string}:${number}:${string}:${string}`
  | `project:${string}`
  | `project-checklists:${string}:${number}`
  | `project-qas:${string}:${number}`
  | `checklist:${string}`
  | `qa:${string}`;

class GlobalCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private subscribers = new Map<string, Set<() => void>>();

  private generateDashboardKey(userId: string): CacheKey {
    return `dashboard:${userId}`;
  }

  private generateProjectsKey(
    userId: string,
    page: number,
    search: string,
    status: string
  ): CacheKey {
    return `projects:${userId}:${page}:${search}:${status}`;
  }

  private generateProjectKey(projectId: string): CacheKey {
    return `project:${projectId}`;
  }

  private generateProjectChecklistsKey(
    projectId: string,
    page: number
  ): CacheKey {
    return `project-checklists:${projectId}:${page}`;
  }

  private generateProjectQAsKey(projectId: string, page: number): CacheKey {
    return `project-qas:${projectId}:${page}`;
  }

  private generateChecklistKey(checklistId: string): CacheKey {
    return `checklist:${checklistId}`;
  }

  private generateQAKey(qaId: string): CacheKey {
    return `qa:${qaId}`;
  }

  private evictOldest(): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > this.defaultTTL;
  }

  private notify(pattern: string): void {
    const callbacks = this.subscribers.get(pattern);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }

  // Dashboard cache methods
  getDashboard(userId: string): DashboardStats | null {
    const key = this.generateDashboardKey(userId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as DashboardStats;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setDashboard(userId: string, data: DashboardStats): void {
    this.evictOldest();
    const key = this.generateDashboardKey(userId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`user:${userId}`],
    });
  }

  // Projects cache methods
  getProjects(
    userId: string,
    page: number,
    search: string,
    status: string
  ): ProjectsData | null {
    const key = this.generateProjectsKey(userId, page, search, status);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as ProjectsData;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProjects(
    userId: string,
    page: number,
    search: string,
    status: string,
    data: ProjectsData
  ): void {
    this.evictOldest();
    const key = this.generateProjectsKey(userId, page, search, status);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`user:${userId}`],
    });
  }

  // Project detail cache methods
  getProject(projectId: string): ProjectResponse | null {
    const key = this.generateProjectKey(projectId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as ProjectResponse;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProject(projectId: string, data: ProjectResponse): void {
    this.evictOldest();
    const key = this.generateProjectKey(projectId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`project:${projectId}`],
    });
  }

  // Project checklists cache methods
  getProjectChecklists(
    projectId: string,
    page: number
  ): PaginatedChecklistData | null {
    const key = this.generateProjectChecklistsKey(projectId, page);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as PaginatedChecklistData;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProjectChecklists(
    projectId: string,
    page: number,
    data: PaginatedChecklistData
  ): void {
    this.evictOldest();
    const key = this.generateProjectChecklistsKey(projectId, page);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      dependencies: [`project:${projectId}`],
    });
  }

  // Project QAs cache methods
  getProjectQAs(projectId: string, page: number): PaginatedQAData | null {
    const key = this.generateProjectQAsKey(projectId, page);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as PaginatedQAData;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProjectQAs(projectId: string, page: number, data: PaginatedQAData): void {
    this.evictOldest();
    const key = this.generateProjectQAsKey(projectId, page);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      dependencies: [`project:${projectId}`],
    });
  }

  // Checklist cache methods
  getChecklist(checklistId: string): ChecklistResponse | null {
    const key = this.generateChecklistKey(checklistId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as ChecklistResponse;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setChecklist(checklistId: string, data: ChecklistResponse): void {
    this.evictOldest();
    const key = this.generateChecklistKey(checklistId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`checklist:${checklistId}`],
    });
  }

  // QA cache methods
  getQA(qaId: string): QAResponse | null {
    const key = this.generateQAKey(qaId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data as QAResponse;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setQA(qaId: string, data: QAResponse): void {
    this.evictOldest();
    const key = this.generateQAKey(qaId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`qa:${qaId}`],
    });
  }

  // Invalidation methods for maintaining cache coherency
  invalidateUserCache(userId: string): void {
    // Clear all cache entries for a user
    const keysToDelete = Array.from(this.cache.keys()).filter(
      (key) =>
        key.includes(userId) ||
        key.startsWith(`dashboard:${userId}`) ||
        key.startsWith(`projects:${userId}`)
    );
    keysToDelete.forEach((key) => this.cache.delete(key));
    this.notify(`user:${userId}`);
  }

  invalidateProjectCache(projectId: string, userId?: string): void {
    // Clear project-specific cache and related user cache
    const keysToDelete = Array.from(this.cache.keys()).filter(
      (key) =>
        key.includes(projectId) ||
        key.startsWith(`project:${projectId}`) ||
        key.startsWith(`project-checklists:${projectId}`) ||
        key.startsWith(`project-qas:${projectId}`)
    );
    keysToDelete.forEach((key) => this.cache.delete(key));

    // Also invalidate user's dashboard and projects list
    if (userId) {
      this.invalidateUserCache(userId);
    }

    this.notify(`project:${projectId}`);
  }

  invalidateChecklistCache(
    checklistId: string,
    projectId?: string,
    userId?: string
  ): void {
    // Clear checklist-specific cache
    const checklistKey = this.generateChecklistKey(checklistId);
    this.cache.delete(checklistKey);

    // Clear related project and user caches
    if (projectId) {
      this.invalidateProjectCache(projectId, userId);
    }

    this.notify(`checklist:${checklistId}`);
  }

  invalidateQACache(qaId: string, projectId?: string, userId?: string): void {
    // Clear QA-specific cache
    const qaKey = this.generateQAKey(qaId);
    this.cache.delete(qaKey);

    // Clear related project and user caches
    if (projectId) {
      this.invalidateProjectCache(projectId, userId);
    }

    this.notify(`qa:${qaId}`);
  }

  // Subscription methods for reactive updates
  subscribe(pattern: string, callback: () => void): () => void {
    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Set());
    }
    this.subscribers.get(pattern)!.add(callback);

    return () => {
      const callbacks = this.subscribers.get(pattern);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(pattern);
        }
      }
    };
  }

  // Utility methods
  clear(): void {
    this.cache.clear();
    this.subscribers.clear();
  }

  getStats(): { size: number; maxSize: number; subscriberCount: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      subscriberCount: this.subscribers.size,
    };
  }

  // Advanced invalidation for bulk operations
  onProjectDeleted(projectId: string, userId: string): void {
    this.invalidateProjectCache(projectId, userId);
  }

  onProjectCreated(userId: string): void {
    this.invalidateUserCache(userId);
  }

  onProjectUpdated(projectId: string, userId: string): void {
    this.invalidateProjectCache(projectId, userId);
  }

  onChecklistCreated(projectId: string, userId: string): void {
    this.invalidateProjectCache(projectId, userId);
  }

  onChecklistDeleted(
    checklistId: string,
    projectId: string,
    userId: string
  ): void {
    this.invalidateChecklistCache(checklistId, projectId, userId);
  }

  onQACreated(projectId: string, userId: string): void {
    this.invalidateProjectCache(projectId, userId);
  }

  onQADeleted(qaId: string, projectId: string, userId: string): void {
    this.invalidateQACache(qaId, projectId, userId);
  }
}

// Export singleton instance
export const globalCache = new GlobalCache();

// Hook for reactive cache updates
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  dependencies: string[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  React.useEffect(() => {
    refetch();

    // Subscribe to cache invalidation events
    const unsubscribers = dependencies.map((dep) =>
      globalCache.subscribe(dep, refetch)
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [refetch, dependencies]);

  return { data, loading, error, refetch };
}
