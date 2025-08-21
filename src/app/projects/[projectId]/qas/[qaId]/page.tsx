"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import {
  Loader2Icon,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";

// API functions
import { fetchQAById, deleteQAById } from "@/api/qas/index";
import { QAResponse } from "@/types/qa";

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

export default function QaPage(props: {
  params: Promise<{ projectId: string; qaId: string }>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [data, setData] = useState<QAResponse | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  const { qaId, projectId } = use(props.params);

  async function fetchQAData() {
    if (!qaId) return;

    setIsLoading(true);
    try {
      const response = await fetchQAById(qaId);
      setData(response);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (qaId) {
      fetchQAData();
    }
  }, [qaId]);

  async function handleDelete() {
    if (!data || !user?.uid) return;

    setIsLoading(true);
    try {
      const userId = user?.uid;

      await deleteQAById(data._id, projectId, userId);

      setData(null);
      router.back();
    } catch (error) {
      console.error("Failed to delete QA run", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setActiveTab(0);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(updatedFiles);

    if (activeTab >= updatedFiles.length && updatedFiles.length > 0) {
      setActiveTab(updatedFiles.length - 1);
    } else if (updatedFiles.length === 0) {
      setActiveTab(0);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "text-red-700 bg-red-100 border-red-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isLoading && !data) {
    return (
      <ProtectedRoute>
        <div className="h-screen w-full flex items-center justify-center flex-col space-y-4">
          <Loader2Icon className="animate-spin h-8 w-8" />
          <p className="text-black font-medium">Loading QA analysis...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-h-full h-full flex flex-col w-full">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel
            defaultSize={50}
            minSize={25}
            maxSize={75}
            className="border-r"
          >
            <div className="h-full p-4 flex flex-col">
              {/* File Upload Section */}
              <div className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      onClick={() => router.back()}
                      className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer border"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Upload Documents
                    </Label>
                    {selectedFiles.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {selectedFiles.length} file
                        {selectedFiles.length !== 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* File Tabs and Preview */}
              {selectedFiles.length > 0 ? (
                <>
                  <div className="flex space-x-2 overflow-x-auto border-b pb-2 mb-4">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-1 text-sm px-3 py-1 rounded-md border whitespace-nowrap ${
                          activeTab === index
                            ? "bg-blue-100 border-blue-500"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <button
                          className="truncate max-w-[120px]"
                          onClick={() => setActiveTab(index)}
                          title={file.name}
                        >
                          {file.name}
                        </button>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1">
                    <iframe
                      src={URL.createObjectURL(selectedFiles[activeTab])}
                      className="w-full h-full border rounded-md"
                      title={`Document-${activeTab}`}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="h-12 w-12 mb-4" />
                  <p className="text-center">
                    Upload documents to preview them here
                    <br />
                    <span className="text-sm">
                      Supports PDF, DOC, DOCX, TXT files
                    </span>
                  </p>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} className="flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {/* QA Results */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-x-2 flex items-center">
                    <h2 className="text-lg font-semibold">
                      Quality Assurance Results
                    </h2>

                    <div>
                      {data && (
                        <Badge
                          variant="outline"
                          className={
                            data.items?.length > 0
                              ? "border-orange-200 text-orange-700 bg-orange-50"
                              : "border-green-200 text-green-700 bg-green-50"
                          }
                        >
                          {data.items?.length || 0} issues found
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={isLoading}
                      className="p-2 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {data?.items && data.items.length > 0 ? (
                  <div className="space-y-4">
                    {data.items.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          {/* <span className="text-xs text-gray-500">
                            Confidence: {item.confidence}
                          </span> */}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.item}
                        </h3>

                        <p className="text-sm text-gray-700 mb-2">
                          {item.description}
                        </p>

                        {item.reference && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Reference:</strong> {item.reference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      No Issues Found
                    </h3>
                    <p className="text-green-700">
                      Your documents passed the quality assurance check. All
                      requirements appear to be met.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the QA
              Run.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isLoading}>
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
                "Delete QA Run"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
