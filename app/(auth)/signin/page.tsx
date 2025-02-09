'use client';
export const dynamic = "force-dynamic";
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
      const response = await axios.post('/api/auth/signin', data);
      
      const { stores } = response.data;

      if (stores && stores.length > 0) {
        const firstStore = stores[0];
        const redirectTo = `/${firstStore.id}/overview`;
        toast.success(`Logged in as ${firstStore.roles[0]}`);

        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      } else {
        toast.error('No accessible stores found.');
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      }
    } catch (error) {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Welcome back
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your credentials to access your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="auth-label">Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="admin@example.com"
                    type="email"
                    className="auth-input"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="auth-label">Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="Enter your password"
                    type="password"
                    className="auth-input"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="auth-button w-full mt-6"
            disabled={loading}
          >
            Sign In
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link 
          href="/signup"
          className="auth-link font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
