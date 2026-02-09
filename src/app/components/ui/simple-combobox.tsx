"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

export interface ComboboxOption {
  label: string;
  value: string;
  metadata?: string;
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

interface SimpleComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  groups: ComboboxGroup[];
  disabled?: boolean;
  className?: string;
}

export function SimpleCombobox({
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  groups,
  disabled = false,
  className,
}: SimpleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Find selected option across all groups
  const selectedOption = React.useMemo(() => {
    for (const group of groups) {
      const option = group.options.find((opt) => opt.value === value);
      if (option) return option;
    }
    return null;
  }, [groups, value]);

  // Filter options based on search
  const filteredGroups = React.useMemo(() => {
    if (!search) return groups;

    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.metadata?.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, search]);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setOpen(false);
    setSearch("");
  };

  // Calculate total options
  const totalOptions = filteredGroups.reduce(
    (acc, group) => acc + group.options.length,
    0
  );

  console.log('🔍 SimpleCombobox - Total options:', totalOptions);
  console.log('🔍 SimpleCombobox - Groups:', filteredGroups);
  console.log('🔍 SimpleCombobox - Open state:', open);
  console.log('🔍 SimpleCombobox - Search:', search);

  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      console.log('🔍 Popover open changing to:', newOpen);
      setOpen(newOpen);
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 !bg-white dark:!bg-slate-950 !border-red-500 !border-4 shadow-lg !z-[9999]" 
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col max-h-[300px] bg-white dark:bg-slate-950">
          {/* Search Input */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3 py-2 bg-white dark:bg-slate-950">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                console.log('🔍 Search changed:', e.target.value);
                setSearch(e.target.value);
              }}
              className="h-9 w-full border-0 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
              autoComplete="off"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1 bg-white dark:bg-slate-950">
            {totalOptions === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </div>
            ) : (
              filteredGroups.map((group) => {
                console.log('🔍 Rendering group in JSX:', group.label, group.options.length);
                return (
                  <div key={group.label} className="mb-2 last:mb-0">
                    {/* Group Heading */}
                    <div className="px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-yellow-100 dark:bg-yellow-900">
                      {group.label}
                    </div>

                    {/* Group Options */}
                    {group.options.map((option) => {
                      console.log('🔍 Rendering option in JSX:', option.label);
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            console.log('🔍 Option clicked:', option.label, option.value);
                            handleSelect(option.value);
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                            "hover:bg-slate-100 dark:hover:bg-slate-800",
                            "focus:bg-slate-100 dark:focus:bg-slate-800",
                            "text-slate-900 dark:text-slate-100",
                            value === option.value && "bg-slate-100 dark:bg-slate-800"
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="truncate">{option.label}</span>
                            {option.metadata && (
                              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                {option.metadata}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}