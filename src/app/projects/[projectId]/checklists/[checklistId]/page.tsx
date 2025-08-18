"use client";

// Shadcn:
import { Button } from "@/components/ui/button";

// lucide-react:
import { CheckCircle2, Loader2Icon, Trash2 } from "lucide-react";

// react:
import { use, useEffect, useState } from "react";

import { checkConnection } from "@/api/index";
import ProtectedRoute from "@/components/ProtectedRoute";

import { deleteChecklistById, fetchChecklistById } from "@/api/checklists";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import BaseModal from "@/components/base/BaseModal";
import { ChecklistResponse } from "@/types/checklist";
import { globalCache } from "@/lib/cache";
import { useAuth } from "@/contexts/AuthContext";

export default function ChecklistPage(props: {
  params: Promise<{ projectId: string; checklistId: string }>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const router = useRouter();
  const user = useAuth();

  const { checklistId, projectId } = use(props.params);

  useEffect(() => {
    if (!checklistId) return;

    const unsubscribe = globalCache.subscribe(
      `checklist:${checklistId}`,
      () => {
        fetchChecklist();
      }
    );

    return unsubscribe;
  }, [checklistId]);

  // Server connection states
  const [serverReady, setServerReady] = useState<boolean>(false);

  const checkConnectionHandler = async () => {
    const response: boolean = await checkConnection();
    if (!response) {
      console.log("Couldn't connect to server", response);
    }
    setServerReady(response);
  };

  useEffect(() => {
    checkConnectionHandler();
    const interval = setInterval(() => {
      if (!serverReady) checkConnectionHandler();
    }, 5000);
    return () => clearInterval(interval);
  }, [serverReady]);

  // Update Logic:
  async function fetchChecklist() {
    if (!checklistId) return;

    // Check cache first
    const cached = globalCache.getChecklist(checklistId);
    if (cached) {
      setChecklist(cached);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchChecklistById(checklistId);
      setChecklist(response);

      // Cache the response
      globalCache.setChecklist(checklistId, response);
    } catch (error) {
      console.error(error);
      setChecklist(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (checklistId) {
      fetchChecklist();
    }
  }, [checklistId]);

  // Delete Checklist:
  async function handleDelete() {
    if (!checklist) return;

    setIsLoading(true);
    try {
      await deleteChecklistById(checklist._id);

      // Invalidate cache after deletion - need user ID and project ID
      const userId = user?.uid;
      if (userId && projectId) {
        globalCache.onChecklistDeleted(checklist._id, projectId, userId);
      }

      setChecklist(null);
      router.back();
    } catch (error) {
      console.error("Failed to delete checklist", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!serverReady || !checklist) {
    return (
      <div className="h-screen w-full flex items-center justify-center flex-col space-y-4">
        <Loader2Icon className="animate-spin h-8 w-8" />
        <p className="text-black font-medium">
          Fetching Checklist, please wait...
        </p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto p-6 space-y-6 overflow-auto max-h-full">
        {/* Top buttons */}
        <div className="flex justify-end space-x-4 ">
          <Button
            className="cursor-pointer bg-white hover:bg-gray-200 border-1 shadow-none"
            onClick={() => {
              setShowDeleteModal(true);
            }}
            disabled={isLoading}
          >
            <Trash2 color="#c70000" strokeWidth={1} />
          </Button>
        </div>

        {/* Editable Project Info */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">{checklist.title}</h2>
          <div className="flex items-end space-x-4 max-w-xl"></div>
        </section>

        {/* Checklist Items (Read-only) */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Checklist Items</h2>
          <div className="space-y-4">
            {checklist.checklist_items.map((item, i) => (
              <Card key={i} className="border border-gray-300">
                <CardHeader>
                  <CardTitle>{item.item}</CardTitle>
                  <div className="text-sm text-gray-600">
                    <p>Category: {item.category}</p>
                    <p>Priority: {item.priority}</p>
                  </div>
                  <p className="text-sm">{item.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Summary of Key Concerns (Read-only) */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Summary of Key Concerns
          </h2>
          <Textarea
            readOnly
            rows={5}
            value={checklist.summary_of_key_concerns}
            className="resize-none bg-gray-50 text-gray-700"
          />
        </section>

        {/* Suggested Next Steps (Read-only) */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Suggested Next Steps</h2>
          <div className="space-y-3">
            {checklist.suggested_next_steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 rounded-md border border-green-300 bg-green-50 p-4"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-gray-900 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <BaseModal
          open={showDeleteModal}
          type="delete"
          title="Delete Checklist"
          message="This action cannot be undone. Do you want to proceed?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
