"use client";

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { permissionCategories } from "./permissions";

interface PermissionDisplayProps {
  permissions: string[];
  showDetails?: boolean;
  maxHeight?: string;
}

export const PermissionDisplay: React.FC<PermissionDisplayProps> = ({
  permissions,
  showDetails = false,
  maxHeight = "600px"
}) => {
  // Group permissions by category
  const groupedPermissions = Object.entries(permissionCategories)
    .map(([key, category]) => {
      const categoryPermissions = category.permissions.filter(p => 
        permissions.includes(p.id)
      );

      if (categoryPermissions.length === 0) return null;

      return {
        key,
        title: category.label,
        description: category.description,
        permissions: categoryPermissions,
        hasView: categoryPermissions.some(p => p.id.endsWith(':view')),
        hasManage: categoryPermissions.some(p => p.id.endsWith(':manage')),
        hasOther: categoryPermissions.some(p => 
          !p.id.endsWith(':view') && !p.id.endsWith(':manage')
        )
      };
    })
    .filter(Boolean);

  if (!showDetails) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {groupedPermissions.map(category => category && (
          <TooltipProvider key={category.key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={getVariantForPermissions(category)}
                  className="cursor-help"
                >
                  {category.title}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{category.description}</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {getAccessLevelText(category)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className={`pr-4 ${maxHeight ? `max-h-[${maxHeight}]` : ''}`}>
      <div className="space-y-4">
        {groupedPermissions.map(category => category && (
          <CategoryCard
            key={category.key}
            category={category}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

interface CategoryCardProps {
  category: {
    key: string;
    title: string;
    description: string;
    permissions: {
      id: string;
      label: string;
      description: string;
    }[];
    hasView: boolean;
    hasManage: boolean;
    hasOther: boolean;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const viewPermissions = category.permissions.filter(p => p.id.endsWith(':view'));
  const managePermissions = category.permissions.filter(p => p.id.endsWith(':manage'));
  const otherPermissions = category.permissions.filter(p => 
    !p.id.endsWith(':view') && !p.id.endsWith(':manage')
  );

  return (
    <Card className="p-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-transparent">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
                <div className="text-left">
                  <h3 className="text-sm font-semibold">
                    {category.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
            </Button>
          </CollapsibleTrigger>
          <div className="flex gap-2">
            {viewPermissions.length > 0 && (
              <Badge variant="outline">View</Badge>
            )}
            {managePermissions.length > 0 && (
              <Badge variant="default">Manage</Badge>
            )}
            {otherPermissions.length > 0 && (
              <Badge variant="secondary">Other</Badge>
            )}
          </div>
        </div>

        <CollapsibleContent>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4">
            {viewPermissions.map(permission => (
              <TooltipProvider key={permission.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-muted-foreground cursor-help">
                      {permission.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{permission.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {managePermissions.map(permission => (
              <TooltipProvider key={permission.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm font-medium cursor-help">
                      {permission.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{permission.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {otherPermissions.map(permission => (
              <TooltipProvider key={permission.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-muted-foreground cursor-help">
                      {permission.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{permission.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

function getVariantForPermissions(category: {
  hasView: boolean;
  hasManage: boolean;
  hasOther: boolean;
}): "default" | "secondary" | "outline" {
  if (category.hasManage) return "default";
  if (category.hasOther) return "secondary";
  return "outline";
}

function getAccessLevelText(category: {
  hasView: boolean;
  hasManage: boolean;
  hasOther: boolean;
}): string {
  if (category.hasManage) return "Full Access";
  if (category.hasOther) return "Partial Access";
  return "View Only";
}
