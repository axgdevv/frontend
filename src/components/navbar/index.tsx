"use client";
import { useRef, useState } from "react";
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  return (
    <div
      className={`bg-white border-b border-gray-200 items-center justify-between flex px-8 py-2`}
    >
      <div className="flex items-center justify-center text-2xl text-[#003627] font-thin space-x-2">
        <span className="font-bold text-[#00332A]">StructCheck AI</span>
      </div>

      <div className="items-center space-x-2 flex">
        <div className="flex space-x-2 items-center"></div>
      </div>
    </div>
  );
}
