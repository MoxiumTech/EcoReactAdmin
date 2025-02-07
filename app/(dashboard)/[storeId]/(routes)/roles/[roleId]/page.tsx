"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Permissions } from "@/types/permissions";

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const permissionGroups = {
  catalog: {
    label: "Catalog",
    permissions: [
      { value: "taxonomies:view", label: "View Categories" },
      { value: "taxonomies:manage", label: "Manage Categories" },
      { value: "products:view", label: "View Products" },
      { value: "products:create", label: "Create Products" },
      { value: "products:edit", label: "Edit Products" },
      { value: "products:delete", label: "Delete Products" },
      { value: "variants:view", label: "View Variants" },
      { value: "variants:manage", label: "Manage Variants" }
    ]
  },
  inventory: {
    label: "Inventory",
    permissions: [
      { value: "stock:view", label: "View Stock" },
      { value: "stock:manage", label: "Manage Stock" },
      { value: "stock-movements:view", label: "View Stock Movements" },
      { value: "stock-movements:manage", label: "Manage Stock Movements" },
      { value: "suppliers:view", label: "View Suppliers" },
      { value: "suppliers:manage", label: "Manage Suppliers" }
    ]
  },
  sales: {
    label: "Sales & Customers",
    permissions: [
      { value: "orders:view", label: "View Orders" },
      { value: "orders:manage", label: "Manage Orders" },
      { value: "customers:view", label: "View Customers" },
      { value: "customers:manage", label: "Manage Customers" },
    ]
  },
  content: {
    label: "Content",
    permissions: [
      { value: "layouts:view", label: "View Layouts" },
      { value: "layouts:manage", label: "Manage Layouts" },
      { value: "billboards:view", label: "View Billboards" },
      { value: "billboards:manage", label: "Manage Billboards" },
      { value: "reviews:view", label: "View Reviews" },
      { value: "reviews:manage", label: "Manage Reviews" }
    ]
  },
  settings: {
    label: "Settings",
    permissions: [
      { value: "settings:view", label: "View Settings" },
      { value: "settings:manage", label: "Manage Settings" },
      { value: "store:view", label: "View Store" },
      { value: "store:manage", label: "Manage Store" }
    ]
  }
};

export default function RolePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoleFormData | null>(null);

  // Load role data
  useEffect(() => {
    const loadRole = async () => {
      try {
        const response = await axios.get(`/api/${params.storeId}/roles/${params.roleId}`);
        setData(response.data);
      } catch (error) {
        toast.error("Error loading role");
        router.push(`/${params.storeId}/roles`);
      }
    };

    loadRole();
  }, [params.roleId, params.storeId, router]);

  const onSubmit = async (e: React.FormEvent) => {
    if (!data) return;
    e.preventDefault();

    try {
      const previousData = { ...data };
      setLoading(true);

      // Optimistically update UI
      const response = await axios.patch(`/api/${params.storeId}/roles/${params.roleId}`, data);
      
      if (response.data.success) {
        toast.success("Role updated successfully");
        router.push(`/${params.storeId}/roles`);
      } else {
        // Revert on failure
        setData(previousData);
        toast.error("Failed to update role");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/${params.storeId}/roles`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roles
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Heading
              title={`Edit Role: ${data.name}`}
              description="Manage role permissions and access levels"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !data.permissions.length}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
        <Separator />
        <div className="grid gap-8">
          {Object.entries(permissionGroups).map(([key, group]) => (
            <Card key={key} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{group.label}</h3>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allPermissions = group.permissions.map(p => p.value);
                        setData({
                          ...data,
                          permissions: [
                            ...new Set([
                              ...data.permissions.filter(p => !allPermissions.includes(p)),
                              ...allPermissions
                            ])
                          ]
                        });
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allPermissions = group.permissions.map(p => p.value);
                        setData({
                          ...data,
                          permissions: data.permissions.filter(p => !allPermissions.includes(p))
                        });
                      }}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.permissions.map((permission) => (
                    <div key={permission.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.value}
                        checked={data.permissions.includes(permission.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setData({
                              ...data,
                              permissions: [...data.permissions, permission.value]
                            });
                          } else {
                            setData({
                              ...data,
                              permissions: data.permissions.filter(p => p !== permission.value)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={permission.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </form>
  );
}
