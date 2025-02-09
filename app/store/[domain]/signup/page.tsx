'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isCustomerAuthenticated } from "@/lib/client-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Heading } from "@/components/ui/heading";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface CustomerSignUpPageProps {
  params: {
    domain: string;
  };
}

type SignUpFormValues = z.infer<typeof formSchema>;

export default function CustomerSignUpPage({ params }: CustomerSignUpPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in using cookie
  useEffect(() => {
    if (isCustomerAuthenticated()) {
      const redirect = searchParams.get('redirect');
      router.replace(redirect || `/store/${params.domain}`);
    }
  }, [params.domain, router, searchParams]);

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
      
      // Get store details from API
      const storeResponse = await axios.get(`/api/store/domain?domain=${params.domain}`);
      const store = storeResponse.data;
      
      // Register with store ID
      const response = await axios.post(`/api/storefront/${store.id}/register`, {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const { customer } = response.data;
      if (customer) {
        toast.success('Account created successfully!');
        router.refresh();
        
        // Check for redirect parameter
        const redirect = searchParams.get('redirect');
        router.replace(redirect || `/store/${params.domain}`);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Store not found.');
      } else if (error.response?.status === 400 && error.response?.data === "Email already in use") {
        toast.error('An account with this email already exists.');
      } else {
        toast.error('Something went wrong.');
        console.error('Registration error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Heading
        title="Sign Up"
        description="Create your account"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="John Doe"
                    type="text"
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="you@example.com"
                    type="email"
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
                    disabled={loading}
                    placeholder="Enter your password"
                    type="password"
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
                    disabled={loading}
                    placeholder="Confirm your password"
                    type="password"
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
            Sign Up
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link 
          href={`/store/${params.domain}/signin`}
          className="text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
