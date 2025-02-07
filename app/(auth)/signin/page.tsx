'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";

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
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Show error message if present in URL
    const error = searchParams?.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setLoading(true);
      console.log('[SIGNIN_PAGE] Attempting signin...');
      const response = await axios.post('/api/auth/signin', data);
      
      const { user, defaultStoreId } = response.data;
      console.log('[SIGNIN_PAGE] Signin successful:', { user, defaultStoreId });

      if (defaultStoreId) {
        // Get admin domain from env or default
        const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.lvh.me:3000';
        
        // Construct the redirect URL to admin domain with overview
        const redirectTo = `http://${adminDomain}/${defaultStoreId}/overview`;
        console.log('[SIGNIN_PAGE] Redirecting to:', redirectTo);

        // First show the success message
        toast.success('Successfully signed in');

        // Wait a bit for the toast to show before redirecting
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      } else {
        toast.error('No accessible stores found.');
        setTimeout(() => {
          window.location.href = '/signin';
        }, 500);
      }
    } catch (error) {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your admin dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="admin@example.com"
                    type="email"
                    className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-0 ring-1 ring-black/5 dark:ring-white/5"
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
                <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="Enter your password"
                    type="password"
                    className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-0 ring-1 ring-black/5 dark:ring-white/5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 space-y-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
          >
            Sign up instead
          </Link>
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="#" className="text-gray-900 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="#" className="text-gray-900 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
