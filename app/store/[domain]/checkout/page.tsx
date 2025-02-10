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
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

import { OrderSummary } from "../components/checkout/order-summary";
import { ShippingForm } from "../components/checkout/shipping-form";
import { DiscountSection } from "../components/checkout/discount-section";
import { Breadcrumb } from "../components/breadcrumb";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const { isInitialized, isLoading, fetchCart } = cart;
  
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      fetchCart();
    }
  }, [isInitialized, isLoading, fetchCart]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!cart.storeId) {
        toast.error("Invalid store ID");
        return;
      }

      if (data.paymentMethod === 'online_payment') {
        // Create temporary order ID
        const tempOrderId = `TEMP_${Date.now()}`;
        
        // Store order data in session storage for later creation
        sessionStorage.setItem('pendingOrderData', JSON.stringify({
          paymentMethod: data.paymentMethod,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          emailDiscount,
          customerDiscount,
          couponDiscount
        }));

        // Create Stripe payment session
        const origin = window.location.origin;
        const paymentResponse = await axios.post(`/api/storefront/${cart.storeId}/payment`, {
          orderData: {
            id: tempOrderId,
            finalAmount: finalTotal,
            cartData: cart.items,
          },
          successUrl: `${origin}/store/${domain}/checkout/success?temp_id=${tempOrderId}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/store/${domain}/checkout?error=payment_cancelled`
        });

        const { url } = paymentResponse.data;
        
        if (!url) {
          throw new Error("Failed to create payment session");
        }

        // Redirect to Stripe checkout
        window.location.href = url;
        return;
      }

      // For cash on delivery, create order immediately
      const response = await axios.post(`/api/storefront/${cart.storeId}/checkout`, {
        paymentMethod: data.paymentMethod,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        emailDiscount,
        customerDiscount,
        couponDiscount,
        isPaid: false,
        status: 'processing'
      });

      const orderId = response.data.id;
      toast.success("Order placed successfully!");
      cart.fetchCart();
      router.push(`/store/${domain}/checkout/success?orderId=${orderId}`);
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
      setIsSubmitting(false);
    }
  };

  if (loading || cart.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Card className="p-8 text-center max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some items to your cart to proceed with checkout</p>
              <Button asChild size="lg" className="w-full">
                <Link href={`/store/${domain}`} className="flex items-center justify-center gap-2">
                  <ArrowLeft size={18} />
                  Continue Shopping
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => {
    return total + (Number(item.variant.price) * item.quantity);
  }, 0);

  const emailDiscountAmount = (emailDiscount / 100) * subtotal;
  const customerDiscountAmount = (customerDiscount / 100) * subtotal;
  const couponDiscountAmount = (couponDiscount / 100) * subtotal;
  const totalDiscounts = emailDiscountAmount + customerDiscountAmount + couponDiscountAmount;
  const finalTotal = subtotal - totalDiscounts;

  const handleDiscountApplied = (newEmailDiscount: number, newCustomerDiscount: number, newCouponDiscount: number) => {
    setEmailDiscount(newEmailDiscount);
    setCustomerDiscount(newCustomerDiscount);
    setCouponDiscount(newCouponDiscount);
  };

  const breadcrumbItems = [
    {
      label: "Cart",
      href: `/store/${domain}/cart`
    },
    {
      label: "Checkout",
      href: `/store/${domain}/checkout`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-2 text-muted-foreground">Complete your purchase securely</p>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Left column - Order summary and discounts */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
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
                  disabled={loading || isSubmitting}
                />
              )}

              <Card className="p-4 flex items-start gap-3 bg-primary/5 border-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Secure Checkout</p>
                  <p className="text-muted-foreground">Your payment information is processed securely through our payment provider.</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Right column - Shipping form */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <ShippingForm
              form={form}
              loading={loading || isSubmitting}
              customerInfo={customerInfo}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
