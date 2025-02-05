"use client";

import * as z from "zod";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";

import { Modal } from "@/components/ui/modal";
import { InviteUrlModal } from "@/components/modals/invite-url-modal";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  roleId: z.string().min(1, "Please select a role"),
});

type InviteFormValues = z.infer<typeof formSchema>;

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [showInviteUrl, setShowInviteUrl] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<{
    url: string;
    email: string;
  } | null>(null);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  // Load available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`/api/${params.storeId}/roles`);
        if (!response.ok) {
          throw new Error("Failed to load roles");
        }
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        toast.error("Failed to load roles");
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [params.storeId, isOpen]);

  const onSubmit = async (data: InviteFormValues) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/${params.storeId}/staff/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error();
      }

      const responseData = await response.json();
      
      if (!responseData.emailSent) {
        const inviteUrl = responseData.acceptUrl;
        const email = form.getValues("email");
        setInviteDetails({
          url: inviteUrl,
          email: email
        });
        setShowInviteUrl(true);
      } else {
        toast.success("Staff invitation sent successfully");
        form.reset();
        onClose();
      }
    } catch (error: any) {
      if (error?.response?.status === 500) {
        const errorText = await error.response.text();
        if (errorText.includes("Email service not configured")) {
          toast.error("Email service is not configured. Please contact the administrator.");
        } else if (errorText.includes("Application URL not configured")) {
          toast.error("Application URL is not configured. Please contact the administrator.");
        } else {
          toast.error("An error occurred while sending the invitation");
        }
      } else if (error?.response?.status === 400) {
        const errorText = await error.response.text();
        toast.error(errorText);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
      title="Invite Staff Member"
      description="Send an invitation to join your store staff"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Enter staff member's email" 
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
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
      <InviteUrlModal
        isOpen={showInviteUrl}
        onClose={() => {
          setShowInviteUrl(false);
          setInviteDetails(null);
          form.reset();
          onClose();
        }}
        inviteUrl={inviteDetails?.url || ''}
        email={inviteDetails?.email || ''}
      />
    </>
  );
};
