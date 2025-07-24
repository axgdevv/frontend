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
      console.log(response);
      setData(response);
      setSelectedFiles([]);
      setIsLoading(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsLoading(false); // Ensure loading state is reset on error
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

  // Connection checking effect
  useEffect(() => {
    checkConnectionHandler();

    // Set up polling interval
    const intervalId = setInterval(async () => {
      if (!serverReady) {
        await checkConnectionHandler();
      }
    }, 5000); // Polling every 5 seconds

    return () => clearInterval(intervalId);
  }, [serverReady]);

  // Show loading screen if server is not ready
  if (!serverReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center flex-col space-y-4">
        <div className="flex justify-center flex-col items-center space-y-4">
          <Loader2Icon className="animate-spin h-8 w-8" />
          <p className="font-medium text-black">
            Connecting to server, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full flex items-center justify-center">
        {!data ? (
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
              className="rounded-md px-8 cursor-pointer mr-8"
              onClick={uploadDocumentsHandler}
            >
              {isLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <p>Upload Files</p>
              )}
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl w-full p-6 rounded-xl border shadow-sm space-y-6 bg-white overflow-y-auto max-h-[80vh]">
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

            <div>
              <h2 className="text-xl font-semibold mb-2">Detected Items</h2>
              {data.items && data.items.length > 0 ? (
                data.items.map((item: PlanCheckItem, index: number) => (
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
        )}
      </div>
    </>
  );
}
