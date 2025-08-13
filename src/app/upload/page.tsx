"use client";

// Shadcn:
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

// lucide-react:
import { Loader2Icon } from "lucide-react";

// react:
import { useEffect, useState } from "react";

import { ingestCityComments } from "@/api/plan-check/index";
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
      const response = await ingestCityComments(formData);
      setData(response);
      // Todo: remove this log, added to prevent build errors
      console.log(data);
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

  return (
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
  );
}
