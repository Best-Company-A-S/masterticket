"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TicketSearchBarProps {
  onSearch?: (searchTerm: string) => void;
}

const TicketSearchBar = ({ onSearch }: TicketSearchBarProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();

        // Scroll to the search input smoothly
        searchRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Focus the search input
        setTimeout(() => {
          searchRef.current?.focus();
        }, 300); // Small delay to ensure scroll completes
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
            isSearchFocused ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <Input
          ref={searchRef}
          variant="search"
          placeholder="Search tickets..."
          className="w-full pl-9"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default TicketSearchBar;
