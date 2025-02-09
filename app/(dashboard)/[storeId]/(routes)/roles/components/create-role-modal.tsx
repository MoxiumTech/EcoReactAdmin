"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

import { Modal } from "@/components/ui/modal";
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
import { PermissionSelector } from "./permissions";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type CreateRoleFormValues = z.infer<typeof formSchema>;

export const CreateRoleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);

  // Permission set for form state management
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    }
  });

  // Reset form and selected permissions when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedPermissions(new Set());
    }
  }, [isOpen, form]);

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
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error("Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Role"
      description="Create a new role with custom permissions"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-4 pr-6">
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
                
                <Separator className="my-4" />
                
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
              </div>
            </ScrollArea>

            <div className="pt-6 space-x-2 flex items-center justify-end w-full border-t">
              <Button
                disabled={loading}
                variant="outline"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button disabled={loading} type="submit">
                Create Role
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};
