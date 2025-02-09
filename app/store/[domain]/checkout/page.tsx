'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import useCart from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

import { OrderSummary } from "../components/checkout/order-summary";
import { ShippingForm } from "../components/checkout/shipping-form";
import { DiscountSection } from "../components/checkout/discount-section";

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
  const [emailDiscount, setEmailDiscount] = useState(0);
  const [customerDiscount, setCustomerDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);

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
  useEffect(() => {
    const loadData = async () => {
      try {
        // Only load profile data if cart is initialized and authenticated
        if (!cart.isInitialized || !cart.customerId) {
          return;
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
  }, [domain, form, cart.isInitialized, cart.customerId]);

  // Initialize cart if needed
  useEffect(() => {
    if (!cart.isInitialized && !cart.isLoading) {
      cart.fetchCart();
    }
  }, [cart.isInitialized, cart.isLoading, cart.fetchCart]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setLoading(true);
      
      // Process checkout - get storeId from cart state which comes from cookie
      if (!cart.storeId) {
        toast.error("Invalid store ID");
        return;
      }

      await axios.post(`/api/storefront/${cart.storeId}/checkout`, {
        paymentMethod: data.paymentMethod,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        customerDiscount,
        couponDiscount
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

  // Calculate discounts
  const emailDiscountAmount = (emailDiscount / 100) * subtotal;
  const customerDiscountAmount = (customerDiscount / 100) * subtotal;
  const couponDiscountAmount = (couponDiscount / 100) * subtotal;
  const totalDiscounts = emailDiscountAmount + customerDiscountAmount + couponDiscountAmount;
  const finalTotal = subtotal - totalDiscounts;

  // Handler for discount updates
  const handleDiscountApplied = (newEmailDiscount: number, newCustomerDiscount: number, newCouponDiscount: number) => {
    setEmailDiscount(newEmailDiscount);
    setCustomerDiscount(newCustomerDiscount);
    setCouponDiscount(newCouponDiscount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <OrderSummary 
            items={cart.items}
            subtotal={subtotal}
            emailDiscount={emailDiscountAmount}
            customerDiscount={customerDiscountAmount}
            couponDiscount={couponDiscountAmount}
            finalTotal={finalTotal}
          />

          {cart.storeId && (
            <DiscountSection
              storeId={cart.storeId}
              onDiscountApplied={handleDiscountApplied}
              disabled={loading}
            />
          )}
        </div>

        <ShippingForm
          form={form}
          loading={loading}
          customerInfo={customerInfo}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
