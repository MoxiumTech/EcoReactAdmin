"use client";

import { useRBAC } from "@/hooks/use-rbac";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Permissions } from "@/types/permissions";

interface PermissionGateProps {
  // Single permission or array of permissions required
  permission: string | string[];
  // Optional manage permission(s) for write operations
  managePermission?: string | string[];
  // If true, all permissions must match (default false - any permission matches)
  requireAll?: boolean;
  children: React.ReactNode;
  // Optional fallback component instead of default access denied
  fallback?: React.ReactNode;
}

export const PermissionGate = ({ 
  permission, 
  managePermission,
  requireAll = false,
  children,
  fallback
}: PermissionGateProps) => {
  const params = useParams();
  const router = useRouter();
  const { hasPermission, isLoading, error } = useRBAC(params.storeId as string);

  // Convert to arrays for consistent handling
  const viewPermissions = Array.isArray(permission) ? permission : [permission];
  const managePermissions = managePermission 
    ? (Array.isArray(managePermission) ? managePermission : [managePermission])
    : [];

  // Error boundary
  if (error) {
    console.error('Permission check error:', error);
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-semibold text-destructive mb-2">System Error</h2>
          <p className="text-center text-muted-foreground mb-4">
            Unable to verify permissions. Please try again later.
          </p>
          <button
            onClick={() => router.push(`/${params.storeId}`)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Check permissions
  const hasAccess = requireAll
    ? viewPermissions.every(p => hasPermission(p)) &&
      (managePermissions.length === 0 || managePermissions.every(p => hasPermission(p)))
    : viewPermissions.some(p => hasPermission(p)) &&
      (managePermissions.length === 0 || managePermissions.some(p => hasPermission(p)));

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-semibold text-primary mb-2">Access Denied</h2>
          <p className="text-center text-muted-foreground mb-4">
            You don&apos;t have permission to access this {managePermissions.length > 0 ? 'action' : 'page'}. 
            Please contact your administrator.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
