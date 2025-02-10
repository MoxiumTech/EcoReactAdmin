"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import ImageUpload from "@/components/ui/image-upload";
import { useState } from "react";

interface BillboardConfigProps {
  form: UseFormReturn<any>;
}

export const BillboardConfig = ({
  form
}: BillboardConfigProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (url: string) => {
    form.setValue("config.imageUrl", url);
    // Extract fileId from the Appwrite URL
    const urlParts = url.split('/');
    const newFileId = urlParts[urlParts.length - 1];
    form.setValue("config.fileId", newFileId);
  };

  const handleImageRemove = (url: string) => {
    form.setValue("config.imageUrl", "");
    form.setValue("config.fileId", "");
  };

  // Get current image URL from form
  const currentImageUrl = form.watch("config.imageUrl") || "";

  return (
    <div className="space-y-6">
      {/* Billboard Content Section */}
      <Card className="p-6">
        <div className="font-medium mb-4">Billboard Content</div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="config.label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input placeholder="New Collection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="config.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Spring 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Background Image</FormLabel>
            <ImageUpload 
              value={currentImageUrl ? [currentImageUrl] : []}
              disabled={uploading}
              onChange={handleImageChange}
              onRemove={handleImageRemove}
            />
          </div>
        </div>
      </Card>

      <Separator />

      {/* Call to Action Section */}
      <Card className="p-6">
        <div className="font-medium mb-4">Call to Action</div>
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="config.callToAction.text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Text</FormLabel>
                <FormControl>
                  <Input placeholder="Shop Now" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="config.callToAction.link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Link</FormLabel>
                <FormControl>
                  <Input placeholder="/collections/new-arrivals" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  );
};
