"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import axios from "axios";

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
import { ArrowLeft } from "lucide-react";
import { PermissionSelector } from "../../components/permissions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type RoleFormValues = z.infer<typeof formSchema>;

interface RoleFormProps {
  initialData: {
    name: string;
    description: string;
    permissions: string[];
  };
  storeId: string;
  roleId: string;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  storeId,
  roleId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(initialData.permissions)
  );

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
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

  const onSubmit = async (data: RoleFormValues) => {
    try {
      setLoading(true);

      const response = await axios.patch(`/api/${storeId}/roles/${roleId}`, {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      });

      if (response.status === 200) {
        toast.success("Role updated successfully");
        router.push(`/${storeId}/roles`);
        router.refresh();
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/${storeId}/roles`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Heading
            title={`Edit Role: ${form.getValues("name")}`}
            description="Manage role permissions and access levels"
          />
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            disabled={loading}
            variant="outline"
            onClick={() => router.push(`/${storeId}/roles`)}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? "Saving..." : "Save Changes"}
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
  );
};
