"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PermissionGroup } from "./permission-group";
import { permissionCategories } from "./categories";
import { PermissionGroup as PermissionGroupType } from "./types";

interface PermissionSelectorProps {
  selectedPermissions: Set<string>;
  onPermissionToggle: (permissionId: string, checked: boolean) => void;
  defaultExpandedCategories?: string[];
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  onPermissionToggle,
  defaultExpandedCategories = ['core', 'catalog']
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Filter categories and permissions based on search term
  const filteredCategories = Object.entries(permissionCategories).reduce<[string, PermissionGroupType][]>((acc, [key, category]) => {
    if (searchTerm) {
      const matchingPermissions = category.permissions.filter(permission =>
        permission.label.toLowerCase().includes(searchTerm) ||
        permission.description.toLowerCase().includes(searchTerm) ||
        permission.id.toLowerCase().includes(searchTerm)
      );

      if (matchingPermissions.length > 0) {
        acc.push([key, { ...category, permissions: matchingPermissions }]);
      }
    } else {
      acc.push([key, category]);
    }
    return acc;
  }, []);

  // Select all or none for all permissions
  const handleSelectAll = () => {
    Object.values(permissionCategories).forEach(category => {
      category.permissions.forEach(permission => {
        if (!selectedPermissions.has(permission.id)) {
          onPermissionToggle(permission.id, true);
        }
      });
    });
  };

  const handleDeselectAll = () => {
    selectedPermissions.forEach(permissionId => {
      onPermissionToggle(permissionId, false);
    });
  };

  const totalPermissions = Object.values(permissionCategories)
    .reduce((sum, category) => sum + category.permissions.length, 0);
  
  const selectedCount = selectedPermissions.size;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                onChange={handleSearch}
                value={searchTerm}
                className="pl-8"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedCount} of {totalPermissions} selected
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
            >
              Deselect All
            </Button>
          </div>
        </div>
      </Card>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {filteredCategories.map(([key, category]) => (
            <PermissionGroup
              key={key}
              label={category.label}
              description={category.description}
              permissions={category.permissions}
              selectedPermissions={selectedPermissions}
              onPermissionToggle={onPermissionToggle}
              expandedByDefault={defaultExpandedCategories.includes(key)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
