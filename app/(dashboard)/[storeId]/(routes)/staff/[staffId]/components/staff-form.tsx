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
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
});

type StaffFormValues = z.infer<typeof formSchema>;

interface Role {
  id: string;
  name: string;
}

interface StaffFormProps {
  initialData: {
    id: string;
    email: string;
    roleId: string;
  };
  roles: Role[];
  storeId: string;
  staffId: string;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  initialData,
  roles,
  storeId,
  staffId,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: StaffFormValues) => {
    try {
      setLoading(true);
      console.log('Submitting staff update:', {
        storeId,
        staffId,
        data
      });

      const response = await axios.patch(`/api/${storeId}/staff/${staffId}`, data);
      console.log('Update response:', response.data);

      if (response.status === 200) {
        toast.success("Staff member updated successfully");
        router.push(`/${storeId}/staff`);
        router.refresh();
      } else {
        toast.error("Failed to update staff member");
      }
    } catch (error: any) {
      console.error('Error updating staff:', error.response || error);
      toast.error(error.response?.data || "Something went wrong");
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
            onClick={() => router.push(`/${storeId}/staff`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Heading
            title="Edit Staff Member"
            description="Update staff member details and role"
          />
        </div>
        <div className="flex items-center gap-x-2">
          <Button
            disabled={loading}
            variant="outline"
            onClick={() => router.push(`/${storeId}/staff`)}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="staff@example.com"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          defaultValue={field.value} 
                          placeholder="Select a role"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};
