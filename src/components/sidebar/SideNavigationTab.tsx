"use client";
import Link from "next/link";

export default function SideNavigationTab(props: any) {
  const isDisabled = props.isDisabled;

  const content = (
    <div
      onClick={
        isDisabled
          ? undefined
          : () => props?.callbackFunction && props?.callbackFunction()
      }
      className={`rounded-xl py-2 px-4 flex items-center space-x-4 z-100
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
