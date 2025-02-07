'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { getStorePublicData } from "@/actions/get-store-by-domain";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import useCart from "@/hooks/use-cart";

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
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/price-formatter";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const formSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  paymentMethod: z.string().min(1, "Payment method is required")
});

type CheckoutFormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain as string;
  const cart = useCart();
  
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      paymentMethod: "cash_on_delivery"
    }
  });

  // Load customer profile on initial mount only
  // Check cart and load profile
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if the cart already has the customer ID from cookie session
        if (!cart.customerId) {
          // Let middleware handle the redirect
          return;
        }

        // Initialize cart if needed and authenticated
        if (cart.items.length === 0) {
          await cart.fetchCart();
        }

        // Load profile data
        const profileResponse = await axios.get(`/api/auth/customer/profile?domain=${domain}`);
        const customerProfile = profileResponse.data?.data;
        
        if (customerProfile) {
          setCustomerInfo({
            name: customerProfile.name || "",
            email: customerProfile.email,
            phone: customerProfile.phone || "",
            address: customerProfile.address || "",
            city: customerProfile.city || "",
            state: customerProfile.state || "",
            postalCode: customerProfile.postalCode || "",
            country: customerProfile.country || ""
          });

          form.reset({
            phone: customerProfile.phone || "",
            address: customerProfile.address || "",
            city: customerProfile.city || "",
            state: customerProfile.state || "",
            postalCode: customerProfile.postalCode || "",
            country: customerProfile.country || "",
            paymentMethod: "cash_on_delivery"
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [domain, form, cart]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setLoading(true);
      
      // Process checkout - get storeId from cart state which comes from cookie
      await axios.post(`/api/storefront/${cart.storeId}/checkout`, {
        paymentMethod: data.paymentMethod,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country
      });

      toast.success("Order placed successfully!");
      router.push(`/store/${domain}/profile`);
    } catch (error: any) {
      if (error.response?.data === "Cart is empty") {
        toast.error("Your cart is empty");
        router.push(`/store/${domain}`);
      } else if (error.response?.data.includes("Insufficient stock")) {
        toast.error("Some items are out of stock");
      } else {
        console.error('Checkout error:', error);
        toast.error("Error processing checkout");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || cart.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push(`/store/${domain}`)}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => {
    return total + (Number(item.variant.price) * item.quantity);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={item.variant.images?.[0]?.url || '/placeholder.png'}
                    alt={item.variant.name}
                    fill
                    className="object-cover rounded"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.variant.product.name}</p>
                  <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                  <p className="text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(item.variant.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </Card>

        {/* Checkout Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {customerInfo && (
                <div className="space-y-2">
                  <p className="font-medium">{customerInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{customerInfo.email}</p>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input disabled={loading} placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="City" {...field} />
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
                        <Input disabled={loading} placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="Postal Code" {...field} />
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
                        <Input disabled={loading} placeholder="Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded-md"
                        disabled={loading}
                        {...field}
                      >
                        <option value="cash_on_delivery">Cash on Delivery</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
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
                Place Order
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
