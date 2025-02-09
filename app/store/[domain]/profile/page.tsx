"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentCustomer } from "@/lib/get-customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain as string;
  const storeId = params?.storeId as string;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    }
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        // Get customer session data
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error("Please sign in to access your profile");
          router.push(`/store/${domain}/signin?redirect=/store/${domain}/profile`);
          return;
        }

        // Use storeId from customer session
        const origin = window.location.origin;
        const profileResponse = await fetch(`${origin}/api/storefront/${customer.storeId}/profile`, {
          credentials: 'include'
        });
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          if (data) {
            form.reset({
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              postalCode: data.postalCode || "",
              country: data.country || "",
            });
          }
        } else if (profileResponse.status === 401) {
          // Force clear auth state and redirect
          document.cookie = "customer_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          router.push(`/store/${domain}/signin?redirect=/store/${domain}/profile`);
        } else {
          throw new Error("Failed to load profile");
        }
      } catch (error) {
        console.error("[PROFILE_LOAD_ERROR]", error);
        if (error instanceof Error) {
          toast.error(error.message || "Failed to load profile");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [form, domain, storeId, router]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      const origin = window.location.origin;
      const response = await fetch(`${origin}/api/storefront/${storeId}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted/60 animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted/60 animate-pulse rounded" />
        </div>
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <div className="h-6 w-48 bg-muted/60 animate-pulse rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted/60 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px w-full bg-muted/60 animate-pulse" />
            <div>
              <div className="h-6 w-48 bg-muted/60 animate-pulse rounded mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted/60 animate-pulse rounded" />
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted/60 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <div className="h-10 w-32 bg-muted/60 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Update your personal information and address details.
        </p>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="John Doe" 
                            className="bg-background"
                            {...field} 
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
                            disabled 
                            type="email" 
                            className="bg-muted"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Email cannot be changed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="(123) 456-7890" 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="font-medium text-lg mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="123 Main St" 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="New York" 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="NY" 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="10001" 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="United States" 
                            className="bg-background"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⭮</span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
