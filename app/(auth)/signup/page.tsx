'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setLoading(true);
      await axios.post('/api/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      toast.success('Account created successfully.');
      router.push('/signin');
    } catch (error: any) {
      if (error.response?.data === "Email already exists") {
        toast.error('Email already in use.');
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Get started with your admin dashboard
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={loading}
                    placeholder="John Doe"
                    className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-0 ring-1 ring-black/5 dark:ring-white/5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="you@example.com"
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
                    placeholder="Create a password"
                    type="password"
                    className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-0 ring-1 ring-black/5 dark:ring-white/5"
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
                <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={loading}
                    placeholder="Confirm your password"
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
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 space-y-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
          >
            Sign in instead
          </Link>
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          By creating an account, you agree to our{' '}
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
