"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  FileText,
  PlayCircle,
  MapPin,
  Calendar,
  Building2,
  Plus,
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle,
  User,
  Layers,
  Trash2,
} from "lucide-react";

import {
  deleteProject,
  fetchProjectById,
  fetchProjectChecklists,
  fetchProjectQAs,
  updateProjectStatus,
} from "@/api/projects";
import CreateChecklistForm from "@/components/projects/checklists/CreateChecklistForm";
import { useAuth } from "@/contexts/AuthContext";
import { generateChecklist } from "@/api/checklists";
import { executeQA } from "@/api/qas";
import { ProjectResponse, ProjectStatus } from "@/types/project";
import { ChecklistResponse } from "@/types/checklist";
import { QAResponse } from "@/types/qa";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetailPage(props: {
  params: Promise<{ projectId: string; checklistId: string }>;
}) {
  const [isCreateChecklistOpen, setIsCreateChecklistOpen] = useState(false);
  const [isCreateQAOpen, setIsCreateQAOpen] = useState(false);
  const { user } = useAuth();
  const { projectId } = use(props.params);

  const [activeTab, setActiveTab] = useState("checklists");

  const [projectData, setProjectData] = useState<ProjectResponse | null>(null);
  const [checklists, setChecklists] = useState<ChecklistResponse[] | []>([]);
  const [qaRuns, setQARuns] = useState<QAResponse[] | []>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checklistPagination, setChecklistPagination] = useState({
    total_pages: 1,
    current_page: 1,
    has_next: false,
    has_prev: false,
    total_checklists: 0,
  });

  const [qaPagination, setQaPagination] = useState({
    total_pages: 1,
    current_page: 1,
    has_next: false,
    has_prev: false,
    total_qas: 0,
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [checklistPage, setChecklistPage] = useState(1);
  const [qaPage, setQAPage] = useState(1);

  useEffect(() => {
    if (projectId && user) fetchChecklistsHandler(projectId, checklistPage);
  }, [checklistPage]);

  useEffect(() => {
    if (projectId && user) fetchPlanQAsHandler(projectId, qaPage);
  }, [qaPage]);

  const fetchProjectDataHandler = async (projectId: string) => {
    try {
      const projectDataResponse = await fetchProjectById(projectId);
      setProjectData(projectDataResponse);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchChecklistsHandler = async (projectId: string, page = 1) => {
    try {
      const response = await fetchProjectChecklists(projectId, page, 4);
      setChecklists(response.checklists || []);
      setChecklistPagination({
        total_pages: response.total_pages || 1,
        current_page: response.current_page || 1,
        has_next: response.has_next || false,
        has_prev: response.has_prev || false,
        total_checklists: response.total_checklists || 0,
      });
    } catch (error) {
      console.error("Error fetching checklists:", error);
    }
  };

  const fetchPlanQAsHandler = async (projectId: string, page = 1) => {
    try {
      const response = await fetchProjectQAs(projectId, page, 4);
      setQARuns(response.qas || []);
      setQaPagination({
        total_pages: response.total_pages || 1,
        current_page: response.current_page || 1,
        has_next: response.has_next || false,
        has_prev: response.has_prev || false,
        total_qas: response.total_qas || 0,
      });
    } catch (error) {
      console.error("Error fetching QA runs:", error);
    }
  };

  const handleUpdateStatus = async (status: ProjectStatus) => {
    if (!projectData || !user) return;

    try {
      const updatedProject = await updateProjectStatus({
        _id: projectId,
        status: status,
      });
      setProjectData(updatedProject); // Optimistic UI update
    } catch (error) {
      console.error("Error updating project status:", error);
      // Optional: Add error handling/toast message
    }
  };

  const handleDeleteProject = async () => {
    if (!user) return;
    try {
      await deleteProject({ _id: projectId, userId: user.uid });

      router.push("/projects"); // Redirect after deletion
    } catch (error) {
      console.error("Error deleting project:", error);
      // Optional: Add error handling/toast message
    }
  };
  const ChecklistPaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-500">
        <span>
          Showing page {checklistPagination.current_page} of{" "}
          {checklistPagination.total_pages}(
          {checklistPagination.total_checklists} total checklists)
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setChecklistPage(1)}
          disabled={!checklistPagination.has_prev}
          variant="outline"
          size="sm"
        >
          First
        </Button>
        <Button
          onClick={() => setChecklistPage(checklistPagination.current_page - 1)}
          disabled={!checklistPagination.has_prev}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => setChecklistPage(checklistPagination.current_page + 1)}
          disabled={!checklistPagination.has_next}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
        <Button
          onClick={() => setChecklistPage(checklistPagination.total_pages)}
          disabled={!checklistPagination.has_next}
          variant="outline"
          size="sm"
        >
          Last
        </Button>
      </div>
    </div>
  );

  const QAPaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-500">
        <span>
          Showing page {qaPagination.current_page} of {qaPagination.total_pages}
          ({qaPagination.total_qas} total QA runs)
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setQAPage(1)}
          disabled={!qaPagination.has_prev}
          variant="outline"
          size="sm"
        >
          First
        </Button>
        <Button
          onClick={() => setQAPage(qaPagination.current_page - 1)}
          disabled={!qaPagination.has_prev}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <Button
          onClick={() => setQAPage(qaPagination.current_page + 1)}
          disabled={!qaPagination.has_next}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
        <Button
          onClick={() => setQAPage(qaPagination.total_pages)}
          disabled={!qaPagination.has_next}
          variant="outline"
          size="sm"
        >
          Last
        </Button>
      </div>
    </div>
  );

  useEffect(() => {
    if (projectId && user) {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([
          fetchProjectDataHandler(projectId),
          fetchChecklistsHandler(projectId),
          fetchPlanQAsHandler(projectId),
        ]);
        setLoading(false);
      };
      fetchData();
    }
  }, [projectId, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusInfo = (status: ProjectStatus) => {
    const statusMap = {
      in_progress: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      under_review: {
        label: "Under Review",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };
    return statusMap[status] || statusMap["in_progress"];
  };

  if (loading || !projectData) {
    return <div></div>;
  }

  const statusInfo = getStatusInfo(projectData.status);
  const latestQA = qaRuns[0];

  const stats = [
    {
      title: "Total Checklists",
      value: projectData.checklist_count?.toString() || "0",
      subtitle:
        checklists.length > 0
          ? `Last created ${formatDate(checklists[0].created_at)}`
          : "None created yet",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Last QA Run",
      value: latestQA ? formatDate(latestQA.created_at) : "No runs",
      subtitle: latestQA
        ? `${latestQA.qa_item_count} issues found`
        : "Run QA to Begin",
      icon: PlayCircle,
      color:
        latestQA && latestQA.qa_item_count > 0
          ? "text-orange-600"
          : "text-green-600",
    },
    {
      title: "QA Runs",
      value: projectData.qa_count?.toString() || "0",
      subtitle:
        qaRuns.length > 0
          ? `Last run ${formatDate(qaRuns[0].created_at)}`
          : "None completed yet",
      icon: RefreshCw,
      color: "text-purple-600",
    },
    {
      title: "Project Status",
      value: statusInfo.label,
      subtitle: projectData.domain,
      icon: Clock,
      color: "text-amber-600",
    },
  ];

  const ChecklistsTable = () => (
    <div className="space-y-4">
      {checklists.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {checklists.map((checklist) => (
                <tr
                  key={checklist._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {checklist.title || "Untitled Checklist"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {checklist.checklist_item_count} items
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {checklist.checklist_item_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(checklist.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => {
                        router.push(`${projectId}/checklists/${checklist._id}`);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ChecklistPaginationControls />
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No checklists yet
          </h3>
          <p className="text-gray-600 mb-4">
            Generate a checklist to identify compliance requirements and next
            steps.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setIsCreateChecklistOpen(true);
            }}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Checklist</span>
          </Button>
        </div>
      )}
    </div>
  );

  const QAsTable = () => (
    <div className="space-y-4">
      {qaRuns.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues Found
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {qaRuns.map((qa) => {
                const hasIssues = qa.qa_item_count > 0;
                return (
                  <tr
                    key={qa._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {qa.title || "QA Run"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(qa.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {hasIssues ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <Badge
                          className={
                            hasIssues
                              ? "bg-red-100 text-red-800 border-red-200 font-medium"
                              : "bg-green-100 text-green-800 border-green-200 font-medium"
                          }
                        >
                          {hasIssues ? "Issues Found" : "Pass"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          hasIssues ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {qa.qa_item_count}{" "}
                        {qa.qa_item_count === 1 ? "issue" : "issues"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          onClick={() => {
                            router.push(`${projectId}/qas/${qa._id}`);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <QAPaginationControls />
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No QA runs yet
          </h3>
          <p className="text-gray-600 mb-4">
            Run quality assurance to identify potential issues and compliance
            gaps.
          </p>
          <Button
            onClick={() => {
              setIsCreateQAOpen(true);
            }}
            className="bg-[#00332A] hover:bg-[#00332A] text-white hover:opacity-90 hover:cursor-pointer"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Run QA
          </Button>
        </div>
      )}
    </div>
  );

  const handleUploadFiles = async (files: File[]) => {
    const formData = new FormData();
    formData.append("user_id", user.uid);
    formData.append("project_id", projectId);
    formData.append("title", `Checklist #${projectData.checklist_count + 1}`);

    files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const response = await generateChecklist(formData);

      router.push(`checklists/${response._id}`);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  if (isCreateChecklistOpen) {
    return (
      <ProtectedRoute>
        <CreateChecklistForm
          onBack={() => setIsCreateChecklistOpen(false)}
          onUploadFiles={handleUploadFiles}
        />
      </ProtectedRoute>
    );
  }

  const handleUploadQAFiles = async (files: File[]) => {
    const formData = new FormData();
    formData.append("user_id", user.uid);
    formData.append("project_id", projectId);
    formData.append("title", `QA #${projectData.qa_count + 1}`);

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await executeQA(formData);

      router.push(`/projects/${projectId}/qa/${response._id}`);
    } catch (error) {
      console.error("Error starting QA analysis:", error);
    }
  };

  if (isCreateQAOpen) {
    return (
      <ProtectedRoute>
        <CreateChecklistForm
          onBack={() => setIsCreateQAOpen(false)}
          onUploadFiles={handleUploadQAFiles}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-h-full h-full overflow-y-auto w-full bg-gray-50 p-6">
        <div className="w-full space-y-6">
          {/* Header - Always Visible */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-0 z-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {projectData.project_name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {projectData.city}, {projectData.state}
                      </span>
                    </div>
                    {projectData.client_name && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{projectData.client_name}</span>
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800 border-purple-200"
                    >
                      {projectData.project_type}
                    </Badge>
                    {projectData.domain && (
                      <div className="flex items-center space-x-1">
                        <Layers className="h-4 w-4" />
                        <span className="capitalize">{projectData.domain}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(projectData.created_at)}</span>
                    </div>
                    <Badge variant="outline" className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateChecklistOpen(true);
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Generate Checklist</span>
                </Button>

                <Button
                  onClick={() => {
                    setIsCreateQAOpen(true);
                  }}
                  className="flex items-center bg-[#00332A] hover:bg-[#00332A] text-white hover:opacity-90 hover:cursor-pointer"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Run QA</span>
                </Button>
                <Select
                  onValueChange={(value: ProjectStatus) =>
                    handleUpdateStatus(value)
                  }
                  value={projectData.status}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "in_progress",
                        "completed",
                        "under_review",
                        "cancelled",
                      ] as ProjectStatus[]
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusInfo(status).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="bg-white hover:bg-gray-100 border-gray-300 transition-colors duration-200 cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600 transition-colors duration-200" />
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        {stat.subtitle && (
                          <p className="text-sm text-gray-500 mt-1 capitalize">
                            {stat.subtitle}
                          </p>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabbed Navigation */}
          <Card className="border-gray-200 shadow-sm">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger
                    value="checklists"
                    className="flex items-center space-x-2 data-[state=active]:bg-white"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Checklists ({projectData.checklist_count || 0})</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="qas"
                    className="flex items-center space-x-2 data-[state=active]:bg-white"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>QA Runs ({projectData.qa_count || 0})</span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-6">
                <TabsContent value="checklists" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Project Checklists
                    </h3>
                    <p className="text-gray-600">
                      Manage compliance requirements and identify next steps for
                      your project
                    </p>
                  </div>
                  <ChecklistsTable />
                </TabsContent>

                <TabsContent value="qas" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quality Assurance Runs
                    </h3>
                    <p className="text-gray-600">
                      Track QA analysis and issue identification across your
                      project
                    </p>
                  </div>
                  <QAsTable />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project, along with all of its associated Checklists and QA runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
