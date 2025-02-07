"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const permissionGroups = {
  catalog: {
    label: "Catalog Management",
    description: "Manage products, categories, and variants",
    permissions: [
      { id: "products:view", label: "View Products", description: "View product details and listings" },
      { id: "products:create", label: "Create Products", description: "Add new products" },
      { id: "products:edit", label: "Edit Products", description: "Modify existing products" },
      { id: "products:delete", label: "Delete Products", description: "Remove products" },
      { id: "variants:view", label: "View Variants", description: "View product variants" },
      { id: "variants:manage", label: "Manage Variants", description: "Create and edit variants" },
      { id: "taxonomies:view", label: "View Categories", description: "View category structure" },
      { id: "taxonomies:manage", label: "Manage Categories", description: "Modify category structure" },
    ]
  },
  inventory: {
    label: "Inventory Management",
    description: "Manage stock and inventory",
    permissions: [
      { id: "stock:view", label: "View Stock", description: "View inventory levels" },
      { id: "stock:manage", label: "Manage Stock", description: "Update stock levels" },
      { id: "stock-movements:view", label: "View Stock Movements", description: "View inventory changes" },
      { id: "stock-movements:manage", label: "Manage Stock Movements", description: "Record stock changes" },
      { id: "suppliers:view", label: "View Suppliers", description: "View supplier information" },
      { id: "suppliers:manage", label: "Manage Suppliers", description: "Manage supplier relationships" },
    ]
  },
  orders: {
    label: "Orders & Customers",
    description: "Manage orders and customer data",
    permissions: [
      { id: "orders:view", label: "View Orders", description: "View order details" },
      { id: "orders:manage", label: "Manage Orders", description: "Process and update orders" },
      { id: "customers:view", label: "View Customers", description: "View customer information" },
      { id: "customers:manage", label: "Manage Customers", description: "Manage customer accounts" },
    ]
  },
  content: {
    label: "Content Management",
    description: "Manage store content and marketing",
    permissions: [
      { id: "layouts:view", label: "View Layouts", description: "View store layouts" },
      { id: "layouts:manage", label: "Manage Layouts", description: "Modify store layouts" },
      { id: "billboards:view", label: "View Billboards", description: "View marketing content" },
      { id: "billboards:manage", label: "Manage Billboards", description: "Create and edit marketing content" },
      { id: "reviews:view", label: "View Reviews", description: "View customer reviews" },
      { id: "reviews:manage", label: "Manage Reviews", description: "Moderate customer reviews" },
    ]
  },
  settings: {
    label: "Settings & Configuration",
    description: "Manage store settings",
    permissions: [
      { id: "settings:view", label: "View Settings", description: "View store settings" },
      { id: "settings:manage", label: "Manage Settings", description: "Modify store settings" },
      { id: "store:view", label: "View Store", description: "View store information" },
      { id: "store:manage", label: "Manage Store", description: "Modify store details" },
    ]
  }
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

type CreateRoleFormValues = z.infer<typeof formSchema>;

export const CreateRoleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    }
  });

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
        throw new Error();
      }

      toast.success("Role created successfully");
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
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
              
              <div className="space-y-4">
                <FormLabel>Permissions</FormLabel>
                <FormDescription>
                  Select the permissions for this role. Hover over items for more details.
                </FormDescription>
                {Object.entries(permissionGroups).map(([key, group]) => (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{group.label}</h3>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentPermissions = new Set(form.getValues("permissions"));
                            group.permissions.forEach(p => currentPermissions.add(p.id));
                            form.setValue("permissions", Array.from(currentPermissions));
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentPermissions = new Set(form.getValues("permissions"));
                            group.permissions.forEach(p => currentPermissions.delete(p.id));
                            form.setValue("permissions", Array.from(currentPermissions));
                          }}
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {group.permissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, permission.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <FormLabel className="font-normal cursor-help">
                                        {permission.label}
                                      </FormLabel>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{permission.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
                <FormMessage />
              </div>
            </div>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
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
