"use client";
import Link from "next/link";

// Todo: Move to a designated interfaces directory
// Interfaces:
interface SideNavigationTabProps {
  isTabActive: boolean;
  isDisabled: boolean;
  navigateTo: string;
  label: string;
  icon: React.ReactNode;
}

export default function SideNavigationTab(props: SideNavigationTabProps) {
  const isDisabled = props.isDisabled;

  const content = (
    <div
      className={`rounded-xl py-2 px-4 flex items-center space-x-4 z-50
        ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-200 cursor-pointer"
        }
        ${props.isTabActive && !isDisabled ? "bg-gray-200" : ""}
      `}
    >
      {props.icon}
    </div>
  );

  return isDisabled ? (
    <div
      className="flex flex-col items-center justify-center w-full"
      aria-disabled="true"
    >
      {content}
      <p className="text-[10px]">{props.label}</p>
    </div>
  ) : (
    <Link
      href={props.navigateTo}
      className="flex flex-col items-center justify-center w-full"
    >
      {content}
      <p className="text-[10px]">{props.label}</p>
    </Link>
  );
}
