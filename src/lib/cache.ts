import React from "react";

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
  | `project-checklists:${string}`
  | `project-qas:${string}`
  | `checklist:${string}`
  | `qa:${string}`;

class GlobalCache {
  private cache = new Map<string, CacheEntry<any>>();
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

  private generateProjectChecklistsKey(projectId: string, page: number) {
    return `project-checklists:${projectId}:${page}`;
  }

  private generateProjectQAsKey(projectId: string, page: number) {
    return `project-qas:${projectId}:${page}`;
  }

  private generateChecklistKey(checklistId: string): CacheKey {
    return `checklist:${checklistId}`;
  }

  private generateQAKey(qaId: string): CacheKey {
    return `qa:${qaId}`;
  }

  private evictOldest() {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.defaultTTL;
  }

  private notify(pattern: string) {
    const callbacks = this.subscribers.get(pattern);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }

  // Dashboard cache methods
  getDashboard(userId: string) {
    const key = this.generateDashboardKey(userId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setDashboard(userId: string, data: any) {
    this.evictOldest();
    const key = this.generateDashboardKey(userId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`user:${userId}`],
    });
  }

  // Projects cache methods
  getProjects(userId: string, page: number, search: string, status: string) {
    const key = this.generateProjectsKey(userId, page, search, status);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
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
    data: any
  ) {
    this.evictOldest();
    const key = this.generateProjectsKey(userId, page, search, status);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`user:${userId}`],
    });
  }

  // Project detail cache methods
  getProject(projectId: string) {
    const key = this.generateProjectKey(projectId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProject(projectId: string, data: any) {
    this.evictOldest();
    const key = this.generateProjectKey(projectId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`project:${projectId}`],
    });
  }

  // Project checklists cache methods
  getProjectChecklists(projectId: string, page: number) {
    const key = this.generateProjectChecklistsKey(projectId, page);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProjectChecklists(projectId: string, page: number, data: any) {
    this.evictOldest();
    const key = this.generateProjectChecklistsKey(projectId, page);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      dependencies: [`project:${projectId}`],
    });
  }

  // Project QAs cache methods
  getProjectQAs(projectId: string, page: number) {
    const key = this.generateProjectQAsKey(projectId, page);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setProjectQAs(projectId: string, page: number, data: any) {
    this.evictOldest();
    const key = this.generateProjectQAsKey(projectId, page);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      dependencies: [`project:${projectId}`],
    });
  }

  // Checklist cache methods
  getChecklist(checklistId: string) {
    const key = this.generateChecklistKey(checklistId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setChecklist(checklistId: string, data: any) {
    this.evictOldest();
    const key = this.generateChecklistKey(checklistId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`checklist:${checklistId}`],
    });
  }

  // QA cache methods
  getQA(qaId: string) {
    const key = this.generateQAKey(qaId);
    const cached = this.cache.get(key);

    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  setQA(qaId: string, data: any) {
    this.evictOldest();
    const key = this.generateQAKey(qaId);
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now(),
      dependencies: [`qa:${qaId}`],
    });
  }

  // Invalidation methods for maintaining cache coherency
  invalidateUserCache(userId: string) {
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

  invalidateProjectCache(projectId: string, userId?: string) {
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
  ) {
    // Clear checklist-specific cache
    const checklistKey = this.generateChecklistKey(checklistId);
    this.cache.delete(checklistKey);

    // Clear related project and user caches
    if (projectId) {
      this.invalidateProjectCache(projectId, userId);
    }

    this.notify(`checklist:${checklistId}`);
  }

  invalidateQACache(qaId: string, projectId?: string, userId?: string) {
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
  subscribe(pattern: string, callback: () => void) {
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
  clear() {
    this.cache.clear();
    this.subscribers.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      subscriberCount: this.subscribers.size,
    };
  }

  // Advanced invalidation for bulk operations
  onProjectDeleted(projectId: string, userId: string) {
    this.invalidateProjectCache(projectId, userId);
  }

  onProjectCreated(userId: string) {
    this.invalidateUserCache(userId);
  }

  onProjectUpdated(projectId: string, userId: string) {
    this.invalidateProjectCache(projectId, userId);
  }

  onChecklistCreated(projectId: string, userId: string) {
    this.invalidateProjectCache(projectId, userId);
  }

  onChecklistDeleted(checklistId: string, projectId: string, userId: string) {
    this.invalidateChecklistCache(checklistId, projectId, userId);
  }

  onQACreated(projectId: string, userId: string) {
    this.invalidateProjectCache(projectId, userId);
  }

  onQADeleted(qaId: string, projectId: string, userId: string) {
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
