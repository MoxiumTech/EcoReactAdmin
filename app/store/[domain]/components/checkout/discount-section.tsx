'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, Gift, Loader2, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await axios.get<PromotionResponse>(`/api/storefront/${storeId}/get-promotions`);
        
        setEmailDiscount(response.data.discounts.email);
        setCustomerDiscount(response.data.discounts.customer);
        
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
      setSubmitting(true);
      const response = await axios.post(`/api/storefront/${storeId}/apply-coupon`, {
        code: couponCode
      });

      const newCouponDiscount = response.data.couponDiscount || 0;
      setCouponDiscount(newCouponDiscount);
      setAppliedCoupon(couponCode);
      
      onDiscountApplied(emailDiscount, customerDiscount, newCouponDiscount);
      toast.success("Discount code applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data || "Invalid discount code");
      setCouponCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponDiscount(0);
    onDiscountApplied(emailDiscount, customerDiscount, 0);
  };

  const renderDiscountBadge = (type: string, value: number) => {
    if (value <= 0) return null;

    return (
      <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5">
        <Check className="h-3.5 w-3.5" />
        <span>{type} (-{value}%)</span>
      </Badge>
    );
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm border shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Apply Discounts</h2>
            <p className="text-sm text-muted-foreground">Enter a discount code or apply available offers</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Discounts */}
            {(emailDiscount > 0 || customerDiscount > 0 || couponDiscount > 0) && (
              <div className="flex flex-wrap gap-2">
                {renderDiscountBadge("Email Signup", emailDiscount)}
                {renderDiscountBadge("Member", customerDiscount)}
                {renderDiscountBadge("Coupon", couponDiscount)}
              </div>
            )}
            
            {/* Coupon Input */}
            <div>
              {appliedCoupon ? (
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{appliedCoupon}</p>
                        <p className="text-sm text-muted-foreground">
                          {couponDiscount}% discount applied
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeCoupon}
                      disabled={disabled || submitting}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={disabled || submitting}
                    className={cn(
                      "bg-white font-medium placeholder:font-normal",
                      "transition-all duration-200",
                      submitting && "opacity-50"
                    )}
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={disabled || submitting || !couponCode}
                    className="min-w-[100px]"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
