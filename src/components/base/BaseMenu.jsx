import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const BaseMenu = ({ iconContainerClass, iconSrc, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown(); // Close dropdown
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Clone children to add onClick handler to each option
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: () => {
          closeDropdown(); // Close dropdown when an option is clicked
          if (child.props.onClick) {
            child.props.onClick(); // Call original onClick if it exists
          }
        },
      });
    }
    return child;
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        className={
          iconContainerClass
            ? iconContainerClass
            : "cursor-pointer flex items-center hover:bg-gray-200 rounded-full p-2"
        }
        onClick={toggleDropdown}
      >
        <ChevronDown strokeWidth={1} />
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 shadow-md z-10 rounded">
          {enhancedChildren}
        </div>
      )}
    </div>
  );
};

export default BaseMenu;
