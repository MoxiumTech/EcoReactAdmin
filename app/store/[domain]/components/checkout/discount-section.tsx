'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { toast } from "react-hot-toast";

interface DiscountSectionProps {
  storeId: string;
  onDiscountApplied: (emailDiscount: number, customerDiscount: number, couponDiscount: number) => void;
  disabled?: boolean;
}

interface PromotionResponse {
  promotions: {
    email: any[];
    coupon: any[];
    customer: any[];
  };
  discounts: {
    email: number;
    customer: number;
  };
}

export const DiscountSection = ({ 
  storeId,
  onDiscountApplied,
  disabled = false 
}: DiscountSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [emailDiscount, setEmailDiscount] = useState(0);
  const [customerDiscount, setCustomerDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Fetch existing promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await axios.get<PromotionResponse>(`/api/storefront/${storeId}/get-promotions`);
        
        setEmailDiscount(response.data.discounts.email);
        setCustomerDiscount(response.data.discounts.customer);
        
        // Apply initial discounts
        onDiscountApplied(response.data.discounts.email, response.data.discounts.customer, 0);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchPromotions();
    }
  }, [storeId, onDiscountApplied]);

  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      setLoading(true);
      const response = await axios.post(`/api/storefront/${storeId}/apply-coupon`, {
        code: couponCode
      });

      const newCouponDiscount = response.data.couponDiscount || 0;
      setCouponDiscount(newCouponDiscount);
      setAppliedCoupon(couponCode);
      
      // Update all discounts
      onDiscountApplied(emailDiscount, customerDiscount, newCouponDiscount);
      toast.success("Discount applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data || "Error applying coupon");
      setCouponCode("");
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponDiscount(0);
    // Update discounts without coupon
    onDiscountApplied(emailDiscount, customerDiscount, 0);
  };

  const renderDiscountDisplay = () => {
    const discounts = [];
    if (emailDiscount > 0) {
      discounts.push(`Email (${emailDiscount}%)`);
    }
    if (customerDiscount > 0) {
      discounts.push(`Customer (${customerDiscount}%)`);
    }
    if (couponDiscount > 0) {
      discounts.push(`Coupon (${couponDiscount}%)`);
    }

    if (discounts.length === 0) {
      return null;
    }

    return (
      <div className="mb-4 p-3 bg-green-50 rounded-md">
        <p className="text-sm text-green-600 font-medium">Applied Discounts:</p>
        <p className="text-sm text-green-700">{discounts.join(', ')}</p>
      </div>
    );
  };

  return (
    <Card className="p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4">Discounts</h2>
      {renderDiscountDisplay()}
      <div className="space-y-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Applied Coupon:</p>
              <p className="text-sm text-green-600">{appliedCoupon}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={removeCoupon}
              disabled={disabled || loading}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={disabled || loading}
            />
            <Button
              onClick={applyCoupon}
              disabled={disabled || loading || !couponCode}
            >
              Apply
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
