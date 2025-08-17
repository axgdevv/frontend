"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createNewProject,
  fetchStructuralProjectsByUser,
} from "@/api/projects/index";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateProjectForm from "@/components/projects/CreateProjectForm";
import { useRouter } from "next/navigation";
import { ProjectResponse } from "@/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Array<ProjectResponse>>([]);
  const [isCreateProjectOpen, setIsCreateProjectOpen] =
    useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchProjectsHandler = async () => {
    if (!user?.uid) {
      console.log("User not ready yet");
      return;
    }
    try {
      const userChecklistsResponse = await fetchStructuralProjectsByUser(
        user.uid
      );
      setProjects(userChecklistsResponse);
    } catch (err) {
      console.error("Failed to fetch checklists", err);
    }
  };

  useEffect(() => {
    fetchProjectsHandler();
  }, [user]);

  const handleCreateProject = async (data: {
    projectName: string;
    clientName: string;
    projectType: string;
    state: string;
    city: string;
  }) => {
    console.log("Project created:", data);
    const projectResponse = await createNewProject({
      ...data,
      userId: user?.uid,
    });

    router.push(`projects/${projectResponse._id}`);
    setIsCreateProjectOpen(false);
  };

  if (isCreateProjectOpen)
    return (
      <ProtectedRoute>
        <CreateProjectForm
          onBack={() => setIsCreateProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />
      </ProtectedRoute>
    );

  return (
    <ProtectedRoute>
      {/* Add button */}
      <div className="w-full h-full">
        <div className="border-b py-4 px-4 flex justify-end">
          <button
            onClick={() => {
              setIsCreateProjectOpen(true);
            }}
            className="text-white bg-[#00332A] rounded-sm py-2 px-4 text-sm cursor-pointer"
          >
            New Project
          </button>
        </div>

        {/* All Projects */}
        <div className="py-8 px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map(({ _id, project_name, client_name }) => (
            <Card key={_id} className="transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{project_name}</CardTitle>
                <p className="text-sm">{client_name}</p>
              </CardHeader>

              <CardFooter className="flex">
                <Button className="w-full">
                  <Link className="w-full" key={_id} href={`projects/${_id}`}>
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
