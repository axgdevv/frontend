"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { checkConnection } from "@/api/index";

interface CreateQAFormProps {
  onBack: () => void;
  onUploadFiles: (files: File[]) => Promise<void>;
}

const CreateQAForm: React.FC<CreateQAFormProps> = ({
  onBack,
  onUploadFiles,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [serverReady, setServerReady] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUploadClick = async () => {
    try {
      setIsLoading(true);
      await onUploadFiles(selectedFiles);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionHandler = async () => {
    const response: boolean = await checkConnection();
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
    <ProtectedRoute>
      <div className="h-screen w-full flex items-center justify-center">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documents">Upload Structural Design</Label>
            <Input
              className="cursor-pointer"
              onChange={handleFileChange}
              multiple
              id="documents"
              type="file"
            />
          </div>
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

          <div className="space-x-2 flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="border cursor-pointer"
            >
              Back
            </Button>
            <Button
              disabled={!selectedFiles.length || isLoading}
              //   variant="outline"
              className="rounded-md px-8 cursor-pointer w-1/2 bg-[#00332A] hover:bg-[#00332A] text-white hover:opacity-90"
              onClick={handleUploadClick}
            >
              {isLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <p>Run QA</p>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CreateQAForm;
