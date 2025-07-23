"use client";
import { useEffect, useState } from "react";
import SideNavigationTab from "./SideNavigationTab";

import { usePathname } from "next/navigation";
import {
  CloudUpload,
  MessagesSquare,
  LayoutDashboard,
  ListCheck,
  NotebookPen,
} from "lucide-react";

export default function Sidebar() {
  const [isHidden, setIsHidden] = useState<boolean>();
  const pathname = usePathname();

  const sideNavigationTabs = [
    {
      label: "Dashboard",
      navigateTo: "/dashboard",
      icon: <LayoutDashboard strokeWidth={1} />,
      isTabActive: pathname.includes("/dashboard"),
      isDisabled: true,
    },
    {
      label: "Checklist",
      navigateTo: "/checklist",
      icon: <ListCheck strokeWidth={1} />,
      isTabActive: pathname.includes("/checklist"),
      isDisabled: true,
    },
    {
      label: "Plan Check",
      navigateTo: "/plan-check",
      icon: <NotebookPen strokeWidth={1} />,
      isTabActive: pathname.includes("/plan-check"),
      isDisabled: false,
    },
    {
      label: "Converse",
      navigateTo: "/converse",
      icon: <MessagesSquare strokeWidth={1} />,
      isTabActive: pathname.includes("/converse"),
      isDisabled: true,
    },
    {
      label: "Upload Docs",
      navigateTo: "/upload",
      icon: <CloudUpload strokeWidth={1} />,
      isTabActive: pathname.includes("/upload"),
      isDisabled: true,
    },
  ];

  return (
    <div
      className={`bg-white left-0 top-0 bottom-0 px-2 flex-col items-center justify-between border-r border-gray-200 py-4 ${
        isHidden ? "hidden" : "hidden md:flex"
      }`}
    >
      {/* <div className=""> */}
      <div className=" space-y-4 md:block hidden">
        {sideNavigationTabs.map((sideNavigationTab, index) => (
          <SideNavigationTab
            key={index}
            isTabActive={sideNavigationTab.isTabActive}
            isDisabled={sideNavigationTab.isDisabled}
            navigateTo={sideNavigationTab.navigateTo}
            label={sideNavigationTab.label}
            icon={sideNavigationTab.icon}
          />
        ))}
      </div>
      {/* </div> */}

      <p className="text-gray-400 py-8">
        v<span className="text-sm"> 1.0</span>
      </p>
    </div>
  );
}
