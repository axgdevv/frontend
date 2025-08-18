"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  createNewProject,
  fetchStructuralProjectsByUser,
} from "@/api/projects/index";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { useRouter } from "next/navigation";
import { ProjectResponse, ProjectStatus } from "@/types/project";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  User,
  Calendar,
  FileText,
  PlayCircle,
  Filter,
  Grid3X3,
  List,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { globalCache } from "@/lib/cache";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Array<ProjectResponse>>([]);
  const [isCreateProjectOpen, setIsCreateProjectOpen] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  // Local state for search inputs (separate from actual search)
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<ProjectStatus | "all">("all");

  const { user } = useAuth();
  const router = useRouter();

  // Subscribe to cache invalidation events
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = globalCache.subscribe(`user:${user.uid}`, () => {
      // Refetch projects when user cache is invalidated
      fetchProjectsHandler(currentPage, searchQuery, statusFilter, false);
    });

    return unsubscribe;
  }, [user?.uid, currentPage, searchQuery, statusFilter]);

  const fetchProjectsHandler = useCallback(
    async (
      page: number = 1,
      search: string = "",
      status: ProjectStatus | "all" = "all",
      useCache: boolean = true
    ) => {
      if (!user?.uid) {
        console.log("User not ready yet");
        return;
      }

      // Check cache first
      if (useCache) {
        const cached = globalCache.getProjects(user.uid, page, search, status);
        if (cached) {
          setProjects(cached.projects);
          setTotalPages(cached.totalPages);
          setTotalProjects(cached.totalProjects);
          setCurrentPage(page);
          return;
        }
      }

      setIsSearching(true);
      try {
        const response = await fetchStructuralProjectsByUser(user.uid, {
          page,
          limit: 4,
          search,
          status: status === "all" ? undefined : status,
        });

        setProjects(response.projects);
        setTotalPages(response.total_pages);
        setTotalProjects(response.total_projects);
        setCurrentPage(response.current_page);

        // Cache the result
        globalCache.setProjects(user.uid, page, search, status, {
          projects: response.projects,
          totalPages: response.total_pages,
          totalProjects: response.total_projects,
        });
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setIsSearching(false);
      }
    },
    [user?.uid]
  );

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchProjectsHandler(1, "", "all", true);
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchProjectsHandler]);

  const handleCreateProject = async (data: {
    projectName: string;
    clientName: string;
    projectType: string;
    state: string;
    city: string;
  }) => {
    try {
      const projectResponse = await createNewProject({
        ...data,
        userId: user?.uid,
      });

      // Invalidate cache after creating new project
      if (user?.uid) {
        globalCache.onProjectCreated(user.uid);
      }

      router.push(`projects/${projectResponse._id}`);
      setIsCreateProjectOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchProjectsHandler(1, "", "all", true);
      setIsLoading(false);
    };

    loadInitialData();
  }, [fetchProjectsHandler]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setStatusFilter(statusInput);
    setCurrentPage(1);
    fetchProjectsHandler(1, searchInput, statusInput, false);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || isSearching) return;
    fetchProjectsHandler(page, searchQuery, statusFilter, true);
  };

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
        icon: Clock,
      },
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
      },
      under_review: {
        label: "Under Review",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };
    return statusMap[status] || statusMap["in_progress"];
  };

  if (isCreateProjectOpen) {
    return (
      <ProtectedRoute>
        <CreateProjectForm
          onBack={() => setIsCreateProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />
      </ProtectedRoute>
    );
  }

  const ProjectCard = ({ project }: { project: ProjectResponse }) => {
    const statusInfo = getStatusInfo(project.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {project.project_name}
                </CardTitle>
                {project.client_name && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{project.client_name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <StatusIcon className="h-4 w-4 text-gray-400" />
              <Badge
                variant="outline"
                className={`${statusInfo.className} text-xs`}
              >
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {(project.city || project.state) && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {project.city && project.state
                    ? `${project.city}, ${project.state}`
                    : project.city || project.state}
                </span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Created {formatDate(project.created_at)}</span>
            </div>

            {project.project_type && (
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
              >
                {project.project_type}
              </Badge>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{project.checklist_count || 0} lists</span>
                </div>
                <div className="flex items-center space-x-1">
                  <PlayCircle className="h-3 w-3" />
                  <span>{project.qa_count || 0} QAs</span>
                </div>
              </div>

              <Button
                asChild
                size="sm"
                className="bg-[#00332A] hover:bg-[#00332A] hover:opacity-90"
              >
                <Link href={`projects/${project._id}`}>View Project</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectListItem = ({ project }: { project: ProjectResponse }) => {
    const statusInfo = getStatusInfo(project.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {project.project_name}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  {project.client_name && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{project.client_name}</span>
                    </div>
                  )}
                  {(project.city || project.state) && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {project.city && project.state
                          ? `${project.city}, ${project.state}`
                          : project.city || project.state}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{project.checklist_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <PlayCircle className="h-4 w-4" />
                  <span>{project.qa_count || 0}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <StatusIcon className="h-4 w-4 text-gray-400" />
                <Badge
                  variant="outline"
                  className={`${statusInfo.className} text-xs`}
                >
                  {statusInfo.label}
                </Badge>
              </div>

              <Button asChild size="sm" variant="outline">
                <Link href={`projects/${project._id}`}>View</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const showPages = 5; // Show up to 5 page numbers
      const half = Math.floor(showPages / 2);

      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + showPages - 1);

      if (end - start < showPages - 1) {
        start = Math.max(1, end - showPages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {(currentPage - 1) * 4 + 1} to{" "}
            {Math.min(currentPage * 4, totalProjects)} of {totalProjects}{" "}
            projects
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isSearching}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={isSearching}
                className="min-w-[2rem]"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isSearching}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-h-full h-full overflow-y-auto w-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              </div>
              <Button
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-[#00332A] hover:bg-[#00332A] hover:opacity-90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters and Search */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search projects, clients, locations..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />

                    <Select
                      value={statusInput}
                      onValueChange={(value) =>
                        setStatusInput(value as ProjectStatus | "all")
                      }
                    >
                      <SelectTrigger className="w-[180px] cursor-pointer">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="under_review">
                          Under Review
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-[#00332A] hover:bg-[#00332A] hover:opacity-90 cursor-pointer"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="cursor-pointer"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="cursor-pointer"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching projects...</span>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {totalProjects === 0
                    ? "No projects yet"
                    : "No projects found"}
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first project to get started with compliance
                  management or try adjusting your search/filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching projects...</span>
                  </div>
                </div>
              )}

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {projects.map((project) =>
                  viewMode === "grid" ? (
                    <ProjectCard key={project._id} project={project} />
                  ) : (
                    <ProjectListItem key={project._id} project={project} />
                  )
                )}
              </div>

              <PaginationControls />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
