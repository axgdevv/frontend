"use client";
import SideNavigationTab from "./SideNavigationTab";

import { usePathname } from "next/navigation";
import {
  CloudUpload,
  MessagesSquare,
  LayoutDashboard,
  ListCheck,
  NotebookPen,
  Folders,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  const sideNavigationTabs = [
    {
      label: "Dashboard",
      navigateTo: "/dashboard",
      icon: <LayoutDashboard strokeWidth={1} />,
      isTabActive: pathname.includes("/dashboard"),
      isDisabled: false,
    },
    {
      label: "Projects",
      navigateTo: "/projects",
      icon: <Folders strokeWidth={1} />,
      isTabActive: pathname.includes("/projects"),
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
      isDisabled: false,
    },
  ];

  useEffect(() => {
    const hiddenValue = pathname.includes("/auth");
    setIsHidden(hiddenValue);
  }, [pathname]);

  return (
    <div
      className={`bg-white left-0 top-0 bottom-0 px-2 flex-col items-center justify-between border-r border-gray-200 py-4 md:flex"
      } ${isHidden ? "hidden" : ""}`}
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
    </div>
  );
}
