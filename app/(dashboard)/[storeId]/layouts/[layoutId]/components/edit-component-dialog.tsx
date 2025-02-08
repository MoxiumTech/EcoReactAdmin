"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BillboardConfig } from "./config/billboard-config";
import { BannerConfig } from "./config/banner-config";
import { ProductsConfig } from "./config/products-config";
import { CategoriesConfig } from "./config/categories-config";
import { SlidingBannersConfig } from "./config/sliding-banners-config";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { LayoutComponent } from "@/types/models";
import { Card } from "@/components/ui/card";
import { Layout, AlertCircle, Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";


const configSchema = z.object({
  config: z.object({
    label: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    imageUrl: z.string().optional(),
    productIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
    maxItems: z.number().optional(),
    itemsPerRow: z.number().optional(),
    displayStyle: z.string().optional(),
    interval: z.number().optional(),
    banners: z.array(z.object({
      id: z.string(),
      label: z.string(),
      imageUrl: z.string(),
      link: z.string().optional()
    })).optional(),
    callToAction: z.object({
      text: z.string().optional(),
      link: z.string().optional()
    }).optional()
  })
});

interface EditComponentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  component: LayoutComponent | null;
  storeId: string;
  layoutId: string;
}

export default function EditComponentDialog({
  isOpen,
  onClose,
  component,
  storeId,
  layoutId
}: EditComponentDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const form = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      config: {}
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !component) return;

      setLoadingData(true);
      try {
        const abortController = new AbortController();

        if (component.type === "products-grid" || 
            component.type === "products-carousel" || 
            component.type === "featured-products") {
          const response = await axios.get(`/api/${storeId}/products`, {
            signal: abortController.signal
          });
          setProducts(response.data);
        }
        
        if (component.type === "categories") {
          const response = await axios.get(`/api/${storeId}/categories`, {
            signal: abortController.signal
          });
          setCategories(response.data);
        }

        return () => abortController.abort();
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching data:', error);
          toast.error("Failed to load configuration data");
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, component, storeId]);

  useEffect(() => {
    if (isOpen && component) {
      form.reset({
        config: component.config || {}
      });
    } else {
      form.reset({ config: {} });
    }
  }, [isOpen, component, form]);

  const onSubmit = async (data: z.infer<typeof configSchema>) => {
    try {
      setLoading(true);
      if (!component?.id) return;

      // Validate sliding banners config
      if (component.type === "sliding-banners") {
        const banners = data.config.banners || [];
        if (!banners.length) {
          toast.error("At least one banner is required");
          return;
        }
        for (const banner of banners) {
          if (!banner.label || !banner.imageUrl) {
            toast.error("All banners must have a label and image");
            return;
          }
        }
      }
      
      console.log('Updating component with data:', data);
      
      await axios.patch(
        `/api/${storeId}/layouts/${layoutId}/components/${component.id}`,
        data
      );
      
      toast.success("Component updated");
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error('Error updating component:', error);
      const errorMessage = error.response?.data || "Failed to update component";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getConfigComponent = () => {
    if (!component) return null;

    if (loadingData) {
      return (
        <Card className="p-6">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader status="Loading your content..."/>
            <p>Loading configuration...</p>
          </div>
        </Card>
      );
    }

    switch (component.type as string) {
      case "billboard":
        return <BillboardConfig form={form} />;
      case "sliding-banners":
        return <SlidingBannersConfig form={form} />;
      case "banner":
        return <BannerConfig form={form} />;
      case "products-grid":
      case "products-carousel":
      case "featured-products":
        return <ProductsConfig form={form} type={component.type} products={products} />;
      case "categories":
        return <CategoriesConfig form={form} categories={categories} />;
      default:
        return (
          <Card className="p-6">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p>No configuration available for this component type.</p>
            </div>
          </Card>
        );
    }
  };

  if (!component) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>
              Configure {component.type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {getConfigComponent()}
            <div className="flex justify-end gap-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={loading || loadingData}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || loadingData}
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}