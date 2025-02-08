'use client';

import * as z from "zod";
import { Trash, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";
import { Textarea } from "@/components/ui/textarea";
import { ExtendedStore } from "../types";

interface SettingsFormProps {
  initialData: ExtendedStore;
}

const formSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  customCss: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testDataOpen, setTestDataOpen] = useState(false);
  const [testDataLoading, setTestDataLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      domain: initialData.domain || '',
      customCss: initialData.customCss || '',
      logoUrl: initialData.logoUrl || '',
      faviconUrl: initialData.faviconUrl || '',
    }
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success('Store updated.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const loadTestData = async () => {
    try {
      setTestDataLoading(true);
      await axios.post(`/api/${params.storeId}/test-data`);
      router.refresh();
      toast.success('Test data loaded successfully.');
    } catch (error) {
      toast.error('Something went wrong loading test data.');
    } finally {
      setTestDataLoading(false);
      setTestDataOpen(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.push('/');
      toast.success('Store deleted.');
    } catch (error) {
      toast.error('Make sure you removed all products and categories first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const storeDomain = initialData.domain
    ? process.env.NODE_ENV === 'development'
      ? `http://${initialData.domain}.lvh.me:3000`
      : `https://${initialData.domain}`
    : null;

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <AlertModal
        isOpen={testDataOpen}
        onClose={() => setTestDataOpen(false)}
        onConfirm={loadTestData}
        loading={testDataLoading}
        title="Load Test Data"
        description="This will add sample data to your store. This action cannot be undone. Are you sure you want to continue?"
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Store settings"
          description="Manage store preferences"
        />
        <div className="flex items-center gap-x-2">
          {storeDomain && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(storeDomain, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
          )}
          <Button
            disabled={loading || testDataLoading}
            variant="secondary"
            size="sm"
            onClick={() => setTestDataOpen(true)}
          >
            Load Test Data
          </Button>
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder={process.env.NODE_ENV === 'development'
                        ? "e.g., store1"
                        : "e.g., store1.yourdomain.com"}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {process.env.NODE_ENV === 'development'
                      ? "Enter only the store name (e.g., 'store1' for store1.lvh.me:3000)"
                      : "Enter your full domain (e.g., 'store1.yourdomain.com')"}
                  </p>
                  {storeDomain && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Store URL: {storeDomain}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Logo</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      value={field.value ? [field.value] : []} 
                      disabled={loading} 
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange('')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="faviconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Favicon</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      value={field.value ? [field.value] : []} 
                      disabled={loading} 
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange('')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="customCss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom CSS</FormLabel>
                <FormControl>
                  <Textarea 
                    disabled={loading}
                    placeholder="Add custom CSS for your store..."
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert 
        title="NEXT_PUBLIC_API_URL" 
        variant="public" 
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};