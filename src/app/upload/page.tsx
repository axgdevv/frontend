"use client";

// Shadcn:
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// lucide-react:
import { Loader2Icon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";

// react:
import { useEffect, useState } from "react";

import { ingestCityComments } from "@/api/knowledgebase/index";
import { checkConnection } from "@/api/index";

// Document categories configuration
const DOCUMENT_CATEGORIES = [
  {
    id: "city_comments",
    name: "City Plan Comments",
    description: "Structural Engineering plan check comments",
  },
  {
    id: "structural_kb",
    name: "Structural Engineering Knowledge Base",
    description: "Structural engineering knowledge base",
  },
  {
    id: "arch_kb",
    name: "Architectural Knowledge Base",
    description: "Architectural knowledge base",
  },
  {
    id: "codes_standards",
    name: "Codes & Standards",
    description: "Building codes and standards",
  },
];

interface UploadResponse {
  status: "success" | "error";
  message: string;
  files_processed: number;
}

export default function PlanCheckPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("city_comments");
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(
    null
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setUploadResponse(null);
    }
  };

  const uploadDocumentsHandler = async () => {
    setIsLoading(true);
    setUploadResponse(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Todo: Upload Conditionally
      let response;
      if (selectedCategory === "city_comments") {
        response = await ingestCityComments(formData);
      } else if (selectedCategory === "structural_kb") {
      } else if (selectedCategory === "arch_kb") {
      } else if (selectedCategory === "arch_kb") {
      } else {
      }

      if (response) {
        setUploadResponse({
          status: response.status || "success",
          message: response.message || "Upload completed successfully",
          files_processed: response.files_processed || selectedFiles.length,
        });

        if (response.status === "success") {
          setSelectedFiles([]);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadResponse({
        status: "error",
        message: `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        files_processed: 0,
      });
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

  const selectedCategoryInfo = DOCUMENT_CATEGORIES.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Document Type</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategoryInfo && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedCategoryInfo.description}
            </p>
          )}
        </div>

        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="documents">Scan Files</Label>
          <Input
            className="cursor-pointer"
            onChange={handleFileChange}
            multiple
            id="documents"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md"
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({selectedFiles.length})</Label>
            <ul className="text-sm space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-white">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span>{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Response */}
        {uploadResponse && (
          <div
            className={`p-3 rounded-lg border ${
              uploadResponse.status === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {uploadResponse.status === "success" ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <AlertCircleIcon className="h-4 w-4" />
              )}
              <div className="text-sm">
                <p className="font-medium">{uploadResponse.message}</p>
                <p>Files processed: {uploadResponse.files_processed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          disabled={!selectedFiles.length || isLoading}
          variant="outline"
          className="rounded-md px-8 cursor-pointer w-full"
          onClick={uploadDocumentsHandler}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2Icon className="animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <p>Upload Files</p>
          )}
        </Button>
      </div>
    </div>
  );
}
