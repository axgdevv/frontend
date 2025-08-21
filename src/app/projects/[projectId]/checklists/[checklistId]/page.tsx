"use client";

// Shadcn:
import { Button } from "@/components/ui/button";

// lucide-react:
import { ArrowLeft, CheckCircle2, Loader2Icon, Trash2 } from "lucide-react";

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
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChecklistPage(props: {
  params: Promise<{ projectId: string; checklistId: string }>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const { checklistId, projectId } = use(props.params);

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

    setIsLoading(true);
    try {
      const response = await fetchChecklistById(checklistId);
      setChecklist(response);
    } catch (error) {
      console.error(error);
      setChecklist(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (checklistId && user?.uid) {
      fetchChecklist();
    }
  }, [checklistId, user]);

  // Delete Checklist:
  async function handleDelete() {
    if (!checklist || !user?.uid) return;

    setIsLoading(true);
    try {
      await deleteChecklistById(checklist._id, projectId, user.uid);

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
        <section className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="mb-4 flex items-center gap-2 text-gray-700 cursor-pointer border"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft size={18} />
          </Button>
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

        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                checklist.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await handleDelete();
                    setShowDeleteModal(false);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  "Delete Checklist"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
