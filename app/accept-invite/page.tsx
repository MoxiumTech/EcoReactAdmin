'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";

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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{
    storeName: string;
    email: string;
    roleName: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const token = searchParams?.get('token');
        console.log('[ACCEPT_INVITE_PAGE] Starting verification with token:', token);

        if (!token) {
          console.log('[ACCEPT_INVITE_PAGE] No token found in URL');
          toast.error('Invalid invitation link');
          router.push('/signin');
          return;
        }

        console.log('[ACCEPT_INVITE_PAGE] Making verify-invite API request...');
        const response = await axios.get(`/api/staff/verify-invite?token=${token}`);
        
        console.log('[ACCEPT_INVITE_PAGE] Verification successful:', {
          data: response.data,
          status: response.status
        });
        
        if (!response.data.storeName || !response.data.roleName) {
          console.error('[ACCEPT_INVITE_PAGE] Invalid response data:', response.data);
          throw new Error('Invalid invitation data');
        }

        setInviteInfo(response.data);
      } catch (error: any) {
        console.error('[ACCEPT_INVITE_PAGE] Verification error:', {
          status: error.response?.status,
          data: error.response?.data,
          error: error
        });
        
        const errorMessage = error.response?.data || 'Invalid or expired invitation';
        
        // Add error message to URL when redirecting
        const searchParams = new URLSearchParams();
        searchParams.set('error', errorMessage);
        
        router.push(`/signin?${searchParams.toString()}`);
      }
    };

    verifyInvitation();
  }, [searchParams, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const token = searchParams?.get('token');
      
      const response = await axios.post('/api/staff/accept-invite', {
        token,
        name: data.name,
        password: data.password
      });

      const { success, store } = response.data;
      
      if (success) {
        toast.success('Account created successfully');
        // Redirect to store dashboard after a brief delay to show the success message
        setTimeout(() => {
          router.push(`/${store.id}/overview`);
        }, 1000);
      } else {
        toast.error('Failed to create account');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.response?.data || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!inviteInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-4 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Verifying invitation...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-4 p-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Accept Invitation</h2>
          <p className="text-muted-foreground">
            You&apos;ve been invited to join {inviteInfo.storeName} as {inviteInfo.roleName}
          </p>
          <p className="text-sm text-muted-foreground">
            Email: {inviteInfo.email}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Enter your name"
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
                      {...field}
                      type="password"
                      disabled={loading}
                      placeholder="Create a password"
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
                      {...field}
                      type="password"
                      disabled={loading}
                      placeholder="Confirm your password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              Create Account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
