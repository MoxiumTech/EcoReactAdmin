export interface Permission {
  id: string;
  label: string;
  description: string;
}

export interface PermissionGroup {
  label: string;
  description: string;
  permissions: Permission[];
  expandedByDefault?: boolean;
}

export type PermissionCategories = Record<string, PermissionGroup>;
