"use client";

// Shadcn:
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

// lucide-react:
import { CheckCircle2, Loader2Icon, Trash2 } from "lucide-react";

// react:
import { use, useEffect, useState } from "react";

import { generateChecklist } from "@/api/plan-check/index";
import { checkConnection } from "@/api/index";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteChecklistById,
  fetchChecklistById,
  updateChecklist,
} from "@/api/checklist";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import BaseModal from "@/components/base/BaseModal";

// Todo: Move to a designated interfaces directory
// Interfaces:
interface ProjectInfo {
  project_name: string;
  client_name: string;
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
  project_info: ProjectInfo;
  checklist_items: ChecklistItem[];
  summary_of_key_concerns: string;
  suggested_next_steps: string[];
  // other fields omitted for brevity
}

export default function PlanCheckPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const [originalProjectInfo, setOriginalProjectInfo] = useState<ProjectInfo>();
  const router = useRouter();

  const { user } = useAuth();
  const { slug } = use(props.params);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const uploadDocumentsHandler = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("user_id", user.uid);
    formData.append("checklist_id", slug);
    selectedFiles.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const response = await generateChecklist(formData);
      setChecklist(response);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsLoading(true);
    try {
      // replace with your fetch function
      const response = await fetchChecklistById(slug);
      setOriginalProjectInfo({
        client_name: response?.project_info.client_name ?? "",
        project_name: response?.project_info.project_name ?? "",
      });
      setChecklist(response);
    } catch (error) {
      console.error(error);
      setChecklist(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchChecklist();
  }, [slug]);

  // Update Project Information:
  function updateProjectInfo(field: keyof ProjectInfo, value: string) {
    if (!checklist) return;
    setChecklist({
      ...checklist,
      project_info: {
        ...checklist.project_info,
        [field]: value,
      },
    });
  }

  async function handleUpdateProjectInfo() {
    if (!checklist) return;
    setIsLoading(true);
    try {
      const updated = await updateChecklist(
        checklist._id,
        checklist.project_info
      );
      // Optionally update local state with returned updated data
      setChecklist((prev) =>
        prev ? { ...prev, project_info: updated.project_info } : prev
      );
      // Also update originalProjectInfo to current values after success
      setOriginalProjectInfo({ ...checklist.project_info });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Delete Checklist:
  async function handleDelete() {
    if (!checklist) return;

    setIsLoading(true);
    try {
      await deleteChecklistById(checklist._id);
      setChecklist(null); // clear local state after deletion
      // optionally redirect user or show a toast/notification
      router.push("/checklist");
    } catch (error) {
      console.error("Failed to delete checklist", error);
      // optionally show error UI or toast notification
    } finally {
      setIsLoading(false);
    }
  }

  if (!serverReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center flex-col space-y-4">
        <Loader2Icon className="animate-spin h-8 w-8" />
        <p className="text-black font-medium">
          Connecting to server, please wait...
        </p>
      </div>
    );
  }

  if (!checklist) {
    return (
      <ProtectedRoute>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documents">Generate Checklist</Label>
              <Input
                className="cursor-pointer"
                onChange={handleFileChange}
                multiple
                id="documents"
                type="file"
              />
            </div>
            {selectedFiles.length > 0 && (
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
            <Button
              disabled={!selectedFiles.length || isLoading}
              variant="outline"
              className="rounded-md px-8 cursor-pointer"
              onClick={uploadDocumentsHandler}
            >
              {isLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <p>Upload Files</p>
              )}
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
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
        <h2 className="text-2xl font-semibold mb-4">Project Information</h2>
        <div className="flex items-end space-x-4 max-w-xl">
          <div>
            <Label htmlFor="project_name">Project Name</Label>
            <Input
              id="project_name"
              value={checklist.project_info.project_name}
              onChange={(e) =>
                updateProjectInfo("project_name", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={checklist.project_info.client_name}
              onChange={(e) => updateProjectInfo("client_name", e.target.value)}
            />
          </div>

          <Button
            className="cursor-pointer"
            onClick={handleUpdateProjectInfo}
            disabled={
              !(
                isLoading ||
                originalProjectInfo?.client_name !==
                  checklist.project_info.client_name ||
                originalProjectInfo?.project_name !==
                  checklist.project_info.project_name
              )
            }
          >
            {isLoading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Save Project Info"
            )}
          </Button>
        </div>
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
        <h2 className="text-2xl font-semibold mb-4">Summary of Key Concerns</h2>
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
  );
}
