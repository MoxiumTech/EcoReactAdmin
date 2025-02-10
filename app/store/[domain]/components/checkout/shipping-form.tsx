'use client';

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
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Truck, User, CreditCard, LucideIcon } from "lucide-react";

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

interface ShippingFormProps {
  form: any;
  loading: boolean;
  customerInfo: CustomerInfo | null;
  onSubmit: (values: any) => Promise<void>;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash_on_delivery",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: CreditCard
  },
  {
    id: "online_payment",
    name: "Pay Online",
    description: "Secure payment via credit card or bank transfer",
    icon: CreditCard
  }
];

export const ShippingForm = ({
  form,
  loading,
  customerInfo,
  onSubmit
}: ShippingFormProps) => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
            {customerInfo && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{customerInfo.name}</p>
                <p>{customerInfo.email}</p>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Shipping Details</h2>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="(123) 456-7890" {...field} className="bg-white" />
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
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input disabled={loading} placeholder="123 Main St" {...field} className="bg-white" />
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
                          <Input disabled={loading} placeholder="City" {...field} className="bg-white" />
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
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder="State" {...field} className="bg-white" />
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
                          <Input disabled={loading} placeholder="Postal Code" {...field} className="bg-white" />
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
                          <Input disabled={loading} placeholder="Country" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{method.name}</p>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full py-6 text-lg font-medium"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};
