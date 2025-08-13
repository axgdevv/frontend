"use client";

// Shadcn:
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

// lucide-react:
import { Loader2Icon, Trash2 } from "lucide-react";

// react:
import { use, useEffect, useState } from "react";

import {
  deletePlanCheckById,
  executePlanCheck,
  fetchPlanCheckById,
  updatePlanCheck,
} from "@/api/plan-check/index";
import { checkConnection } from "@/api/index";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import BaseModal from "@/components/base/BaseModal";

// Todo: Move to a designated interfaces directory
// Interfaces:
interface ProjectInfo {
  project_name: string;
  client_name: string;
}

interface PlanCheckItem {
  category: string;
  item: string;
  description: string;
  priority: string;
  reference: string;
  confidence: string;
}

interface PlanCheckResponse {
  _id: string;
  project_info: ProjectInfo;
  items: PlanCheckItem[];
}

export default function PlanCheckPage(props: {
  params: Promise<{ id: string }>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [data, setData] = useState<PlanCheckResponse | null>();
  const [originalProjectInfo, setOriginalProjectInfo] = useState<ProjectInfo>();

  const { user } = useAuth();
  const { id } = use(props.params);
  const router = useRouter();

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
    formData.append("plan_check_id", id);

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await executePlanCheck(formData);
      setData(response);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchPlanCheck() {
    setIsLoading(true);
    try {
      // replace with your fetch function
      const response = await fetchPlanCheckById(id);
      setOriginalProjectInfo({
        client_name: response?.project_info.client_name ?? "",
        project_name: response?.project_info.project_name ?? "",
      });
      setData(response);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

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

  useEffect(() => {
    fetchPlanCheck();
  }, [id]);

  function updateProjectInfo(field: keyof ProjectInfo, value: string) {
    if (!data) return;
    setData({
      ...data,
      project_info: {
        ...data.project_info,
        [field]: value,
      },
    });
  }

  async function handleUpdateProjectInfo() {
    if (!data) return;
    setIsLoading(true);
    try {
      const updated = await updatePlanCheck(data._id, data.project_info);
      // Optionally update local state with returned updated data
      setData((prev) =>
        prev ? { ...prev, project_info: updated.project_info } : prev
      );
      // Also update originalProjectInfo to current values after success
      setOriginalProjectInfo({ ...data.project_info });

      console.log("Updating project info...", data.project_info);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!data) return;

    setIsLoading(true);
    try {
      await deletePlanCheckById(data._id);
      setData(null); // clear local state after deletion
      // optionally redirect user or show a toast/notification
      router.push("/plan-check");
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

  if (!data) {
    return (
      <ProtectedRoute>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documents">Scan Files</Label>
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
    <ProtectedRoute>
      <ResizablePanelGroup direction="horizontal" className="w-full h-screen">
        <ResizablePanel
          defaultSize={50}
          minSize={25}
          maxSize={75}
          className="p-4 border-r"
        >
          {selectedFiles.length > 0 ? (
            <>
              <div className="flex space-x-2 overflow-x-auto border-b pb-2">
                {selectedFiles.map((file, index) => (
                  <button
                    key={index}
                    className={`text-sm px-3 py-1 rounded-md border ${
                      activeTab === index
                        ? "bg-blue-100 border-blue-500"
                        : "bg-white"
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 h-[90%]">
                <iframe
                  src={URL.createObjectURL(selectedFiles[activeTab])}
                  className="w-full h-full border rounded-md"
                  title={`PDF-${activeTab}`}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 italic">
              Could not load project files.
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} className="flex flex-col">
          <div className="flex-1 overflow-y-auto my-4 px-4">
            <div>
              <div className="">
                <div className="flex justify-end space-x-4 ">
                  <Button
                    className="cursor-pointer bg-white hover:bg-gray-200 border-1 shadow-none"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isLoading}
                  >
                    <Trash2 color="#c70000" strokeWidth={1} />
                  </Button>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Project Information
                </h2>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold" htmlFor="project_name">
                  Project Name
                </Label>
                <Input
                  id="project_name"
                  value={data.project_info.project_name}
                  onChange={(e) =>
                    updateProjectInfo("project_name", e.target.value)
                  }
                  placeholder="Project Name"
                />
                <Label className="text-sm font-semibold" htmlFor="client_name">
                  Client Name
                </Label>
                <Input
                  id="client_name"
                  value={data.project_info.client_name}
                  onChange={(e) =>
                    updateProjectInfo("client_name", e.target.value)
                  }
                  placeholder="Client Name"
                />
                <Button
                  className="cursor-pointer"
                  onClick={handleUpdateProjectInfo}
                  disabled={
                    !(
                      isLoading ||
                      originalProjectInfo?.client_name !==
                        data.project_info.client_name ||
                      originalProjectInfo?.project_name !==
                        data.project_info.project_name
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
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Detected Items</h2>
              {data.items && data.items.length > 0 ? (
                data.items.map((item, index) => (
                  <div
                    key={index}
                    className="mb-4 p-4 border rounded-lg bg-gray-50"
                  >
                    <p className="text-sm text-gray-600 mb-1 flex justify-between">
                      <span>
                        <strong>Category:</strong> {item.category}
                      </span>
                      <span>
                        <strong>Priority:</strong>{" "}
                        <span
                          className={`font-medium ${
                            item.priority === "Critical"
                              ? "text-red-700"
                              : item.priority === "High"
                              ? "text-red-500"
                              : item.priority === "Medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </span>
                    </p>
                    <p className="font-semibold text-gray-800">{item.item}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Description:</strong> {item.description}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Reference:</strong> {item.reference}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Confidence:</strong> {item.confidence}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No issues found during the plan check. The documents are
                  compliant with the checklist.
                </p>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <BaseModal
        open={showDeleteModal}
        type="delete"
        title="Delete Plan-Check"
        message="This action cannot be undone. Do you want to proceed?"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </ProtectedRoute>
  );
}
