"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

export interface ComboboxOption {
  label: string;
  value: string;
  metadata?: string; // e.g., "1,000 rows" or "Connected"
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

interface ComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  groups: ComboboxGroup[];
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  groups,
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Combobox groups:', groups);
    console.log('🔍 Total options:', groups.reduce((acc, g) => acc + g.options.length, 0));
  }, [groups]);

  // Find selected option across all groups
  const selectedOption = React.useMemo(() => {
    for (const group of groups) {
      const option = group.options.find((opt) => opt.value === value);
      if (option) return option;
    }
    return null;
  }, [groups, value]);

  // Calculate total options count
  const totalOptions = groups.reduce((acc, group) => acc + group.options.length, 0);

  console.log('🔍 Rendering Combobox with', totalOptions, 'total options');

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {groups.map((group) => {
              // Only render groups that have options
              if (group.options.length === 0) {
                console.log('⚠️ Skipping empty group:', group.label);
                return null;
              }

              console.log('✅ Rendering group:', group.label, 'with', group.options.length, 'options');
              
              return (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.options.map((option) => {
                    console.log('  ✅ Rendering option:', option.label, '=', option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => {
                          console.log('Selected:', option.value, option.label);
                          onValueChange?.(option.value);
                          setOpen(false);
                        }}
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
                            <span className="ml-2 text-xs text-muted-foreground">
                              {option.metadata}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}