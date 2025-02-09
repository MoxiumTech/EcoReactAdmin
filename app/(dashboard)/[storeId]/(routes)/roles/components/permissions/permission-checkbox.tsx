"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface PermissionCheckboxProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  showTooltip?: boolean;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  showTooltip = true,
  badgeVariant
}) => {
  const content = (
    <div className="flex flex-row items-start space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={id}
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          {label}
          {badgeVariant && (
            <Badge variant={badgeVariant} className="ml-2">
              {id.split(':')[1]}
            </Badge>
          )}
        </label>
      </div>
    </div>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
