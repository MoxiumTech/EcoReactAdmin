"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type JoinFormValues = z.infer<typeof formSchema>;

interface JoinFormProps {
  invitation: {
    id: string;
    email: string;
    store: {
      name: string;
    };
    role: {
      name: string;
    };
  };
}

export const JoinForm: React.FC<JoinFormProps> = ({
  invitation
}) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<JoinFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    }
  });

  const onSubmit = async (data: JoinFormValues) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${params.storeId}/staff/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          password: data.password,
          invitationId: invitation.id,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Successfully joined staff team");
      router.refresh();
      router.push(`/${params.storeId}/staff`);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-6">
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium">Complete Your Account</h3>
        <p className="text-sm text-muted-foreground">Join {invitation.store.name} as {invitation.role.name}</p>
        <p className="text-sm text-muted-foreground">Your email: {invitation.email}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input 
                    disabled={loading} 
                    placeholder="Enter your full name"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    disabled={loading} 
                    type="password"
                    placeholder="Create a password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    disabled={loading} 
                    type="password"
                    placeholder="Confirm your password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            disabled={loading} 
            type="submit" 
            className="w-full"
          >
            Join Team
          </Button>
        </form>
      </Form>
    </Card>
  );
};
