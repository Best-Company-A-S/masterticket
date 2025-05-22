"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Filter } from "lucide-react";
import * as React from "react";

const statuses = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Closed", value: "CLOSED" },
  { label: "On Hold", value: "ON_HOLD" },
];

const priorities = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

interface TicketFiltersProps {
  onStatusChange?: (values: string[]) => void;
  onPriorityChange?: (values: string[]) => void;
}

export function TicketFilters({
  onStatusChange,
  onPriorityChange,
}: TicketFiltersProps) {
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [priorityOpen, setPriorityOpen] = React.useState(false);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = React.useState<string[]>(
    []
  );

  const handleStatusSelect = (value: string) => {
    const newSelectedStatuses = selectedStatuses.includes(value)
      ? selectedStatuses.filter((item) => item !== value)
      : [...selectedStatuses, value];

    setSelectedStatuses(newSelectedStatuses);
    onStatusChange?.(newSelectedStatuses);
  };

  const handlePrioritySelect = (value: string) => {
    const newSelectedPriorities = selectedPriorities.includes(value)
      ? selectedPriorities.filter((item) => item !== value)
      : [...selectedPriorities, value];

    setSelectedPriorities(newSelectedPriorities);
    onPriorityChange?.(newSelectedPriorities);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Status
            {selectedStatuses.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedStatuses.length}
              </Badge>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search status..." />
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={() => handleStatusSelect(status.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStatuses.includes(status.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {status.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Priority
            {selectedPriorities.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedPriorities.length}
              </Badge>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search priority..." />
            <CommandEmpty>No priority found.</CommandEmpty>
            <CommandGroup>
              {priorities.map((priority) => (
                <CommandItem
                  key={priority.value}
                  value={priority.value}
                  onSelect={() => handlePrioritySelect(priority.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPriorities.includes(priority.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {priority.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
