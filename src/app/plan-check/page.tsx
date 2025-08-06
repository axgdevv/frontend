"use client";

// Shadcn:
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

// lucide-react:
import { Loader2Icon } from "lucide-react";

// react:
import { useEffect, useState } from "react";

import { executePlanCheck } from "@/api/plan-check/index";
import { checkConnection } from "@/api/index";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  project_info: ProjectInfo;
  items: PlanCheckItem[];
}

export default function PlanCheckPage() {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [data, setData] = useState<PlanCheckResponse>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const uploadDocumentsHandler = async () => {
    setIsLoading(true);
    const formData = new FormData();
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
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={50} className="flex flex-col">
          <div className="flex-1 overflow-y-auto my-4 px-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Project Information
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700">
                <li>
                  <strong>Project Name:</strong>{" "}
                  {data.project_info?.project_name || "N/A"}
                </li>
                <li>
                  <strong>Client Name:</strong>{" "}
                  {data.project_info?.client_name || "N/A"}
                </li>
              </ul>
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
    </ProtectedRoute>
  );
}
