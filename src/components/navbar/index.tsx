"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BaseMenu from "../base/BaseMenu";
import Image from "next/image";
import { User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const { user, signOut } = useAuth();

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  useEffect(() => {
    const hiddenValue = pathname.includes("/auth");
    setIsHidden(hiddenValue);
  }, [pathname]);

  return (
    <div
      className={`bg-white border-b border-gray-200 items-center justify-between flex px-8 py-2 ${
        isHidden ? "hidden" : ""
      }`}
    >
      <div className="flex items-center justify-center text-2xl text-[#003627] font-thin space-x-2">
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            width={40}
            height={40}
            className="rounded-md"
            alt="Picture of the author"
          />
        </Link>
        <span className="font-bold text-[#00332A]">StructCheck AI</span>
      </div>

      <div className="items-center space-x-2 flex">
        <div className="flex space-x-2 items-center">
          <Avatar>
            <AvatarImage
              className="rounded-full h-8 w-8"
              src={user?.photoURL}
            />
            <AvatarFallback className="bg-gray-100">
              <User className="w-5 h-5 text-gray-500" />
            </AvatarFallback>
          </Avatar>
          {user?.displayName ? (
            <p className="text-sm">{user?.displayName.split(" ")[0]}</p>
          ) : (
            <p className="text-sm">User</p>
          )}

          <BaseMenu
            iconSrc="/icons/navbar/chevron-down.svg"
            iconContainerClass="cursor-pointer flex items-center rounded-full "
          >
            <div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 hover:cursor-pointer border-none text-red-600"
              >
                Sign Out
              </button>
            </div>
          </BaseMenu>
        </div>
      </div>
    </div>
  );
}
