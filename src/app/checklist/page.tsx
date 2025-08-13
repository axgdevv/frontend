"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { fetchChecklistsByUser } from "@/api/checklist/index";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProjectInfo {
  project_name: string;
  client_name: string;
}

interface ChecklistItem {
  category: string;
  item: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

interface ChecklistResponse {
  _id: string;
  user_id: string;
  project_info: ProjectInfo;
  checklist_items: ChecklistItem[];
  summary_of_key_concerns: string;
  suggested_next_steps: string[];
  // other fields omitted for brevity
}

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<Array<ChecklistResponse>>([]);
  const { user } = useAuth();

  const fetchChecklistsHandler = async () => {
    if (!user?.uid) {
      console.log("User not ready yet");
      return;
    }
    try {
      const userChecklistsResponse = await fetchChecklistsByUser(user.uid);
      setChecklists(userChecklistsResponse);
    } catch (err) {
      console.error("Failed to fetch checklists", err);
    }
  };

  useEffect(() => {
    fetchChecklistsHandler();
  }, [user]);

  return (
    <ProtectedRoute>
      {/* Add button */}
      <div className="w-full h-full">
        <div className="border-b py-4 px-4 flex justify-end">
          <Link href={`checklist/${uuidv4()}`}>
            <button
              onClick={() => {}}
              className="text-white bg-[#00332A] rounded-sm py-2 px-4 text-sm cursor-pointer"
            >
              New Checklist
            </button>
          </Link>
        </div>

        {/* All Checklist */}
        <div className="py-8 px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {checklists.map(({ _id, project_info }) => (
            <Card key={_id} className="transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{project_info.project_name}</CardTitle>
                <p className="text-sm">{project_info.client_name}</p>
              </CardHeader>

              <CardFooter className="flex">
                <Button className="w-full">
                  <Link className="w-full" key={_id} href={`/checklist/${_id}`}>
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
