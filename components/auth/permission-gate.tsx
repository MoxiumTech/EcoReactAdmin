"use client";

import { useRBAC } from "@/hooks/use-rbac";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Permissions } from "@/types/permissions";

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
}

export const PermissionGate = ({ permission, children }: PermissionGateProps) => {
  const params = useParams();
  const router = useRouter();
  const { hasPermission, isLoading } = useRBAC(params.storeId as string);
  
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-semibold text-primary mb-2">Access Denied</h2>
          <p className="text-center text-muted-foreground mb-4">
            You don&apos;t have permission to access this page. Please contact your administrator.
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
