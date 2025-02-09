"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PermissionSelector } from "../components/permissions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type CreateRoleFormValues = z.infer<typeof formSchema>;

export default function NewRolePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const newPermissions = new Set(selectedPermissions);
    if (checked) {
      newPermissions.add(permissionId);
    } else {
      newPermissions.delete(permissionId);
    }
    setSelectedPermissions(newPermissions);
    form.setValue('permissions', Array.from(newPermissions), {
      shouldValidate: true
    });
  };

  const onSubmit = async (data: CreateRoleFormValues) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/${params.storeId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          permissionNames: data.permissions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create role');
      }

      toast.success("Role created successfully");
      router.push(`/${params.storeId}/roles`);
      router.refresh();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error("Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate
      permission={Permissions.VIEW_ROLES}
      managePermission={Permissions.MANAGE_ROLES}
    >
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Create Role"
            description="Create a new role with custom permissions"
          />
          <div className="flex items-center gap-x-2">
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
            >
              Create
            </Button>
          </div>
        </div>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={loading} 
                        placeholder="e.g., Marketing Manager"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        disabled={loading} 
                        placeholder="Describe the role's responsibilities"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormControl>
                    <PermissionSelector
                      selectedPermissions={selectedPermissions}
                      onPermissionToggle={handlePermissionToggle}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        </div>
      </div>
    </PermissionGate>
  );
}
