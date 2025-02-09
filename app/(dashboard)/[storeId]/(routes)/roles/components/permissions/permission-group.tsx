"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PermissionCheckbox } from "./permission-checkbox";
import { Permission } from "./types";

interface PermissionGroupProps {
  label: string;
  description: string;
  permissions: Permission[];
  selectedPermissions: Set<string>;
  onPermissionToggle: (permissionId: string, checked: boolean) => void;
  expandedByDefault?: boolean;
}

export const PermissionGroup: React.FC<PermissionGroupProps> = ({
  label,
  description,
  permissions,
  selectedPermissions,
  onPermissionToggle,
  expandedByDefault = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);

  // Calculate badge counts
  const viewPermissions = permissions.filter(p => p.id.endsWith(':view'));
  const managePermissions = permissions.filter(p => p.id.endsWith(':manage'));
  const otherPermissions = permissions.filter(p => 
    !p.id.endsWith(':view') && !p.id.endsWith(':manage')
  );

  const selectedViewCount = viewPermissions.filter(p => 
    selectedPermissions.has(p.id)
  ).length;
  const selectedManageCount = managePermissions.filter(p => 
    selectedPermissions.has(p.id)
  ).length;
  const selectedOtherCount = otherPermissions.filter(p => 
    selectedPermissions.has(p.id)
  ).length;

  const handleSelectAll = () => {
    permissions.forEach(permission => {
      if (!selectedPermissions.has(permission.id)) {
        onPermissionToggle(permission.id, true);
      }
    });
  };

  const handleDeselectAll = () => {
    permissions.forEach(permission => {
      if (selectedPermissions.has(permission.id)) {
        onPermissionToggle(permission.id, false);
      }
    });
  };

  return (
    <Card className="p-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between mb-4">
          <div>
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
                      {label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2 mr-4">
              {viewPermissions.length > 0 && (
                <Badge variant="outline">
                  View {selectedViewCount}/{viewPermissions.length}
                </Badge>
              )}
              {managePermissions.length > 0 && (
                <Badge variant="default">
                  Manage {selectedManageCount}/{managePermissions.length}
                </Badge>
              )}
              {otherPermissions.length > 0 && (
                <Badge variant="secondary">
                  Other {selectedOtherCount}/{otherPermissions.length}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <CollapsibleContent>
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {viewPermissions.map((permission) => (
              <PermissionCheckbox
                key={permission.id}
                id={permission.id}
                label={permission.label}
                description={permission.description}
                checked={selectedPermissions.has(permission.id)}
                onCheckedChange={(checked) => onPermissionToggle(permission.id, checked)}
                badgeVariant="outline"
              />
            ))}
            {managePermissions.map((permission) => (
              <PermissionCheckbox
                key={permission.id}
                id={permission.id}
                label={permission.label}
                description={permission.description}
                checked={selectedPermissions.has(permission.id)}
                onCheckedChange={(checked) => onPermissionToggle(permission.id, checked)}
                badgeVariant="default"
              />
            ))}
            {otherPermissions.map((permission) => (
              <PermissionCheckbox
                key={permission.id}
                id={permission.id}
                label={permission.label}
                description={permission.description}
                checked={selectedPermissions.has(permission.id)}
                onCheckedChange={(checked) => onPermissionToggle(permission.id, checked)}
                badgeVariant="secondary"
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
