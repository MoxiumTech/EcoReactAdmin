"use client";

import * as z from "zod";
import { useState } from "react";
import { Grip, Plus, Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";

interface BannerItem {
  id: string;
  label: string;
  imageUrl: string;
  link?: string;
}

interface SlidingBannersConfigProps {
  form: UseFormReturn<{
    config: {
      banners?: BannerItem[];
      interval?: number;
    };
  }>;
}

export function SlidingBannersConfig({ form }: SlidingBannersConfigProps) {
  const [isLoading, setIsLoading] = useState(false);

  const banners = form.watch("config.banners") || [];

  const generateUniqueId = () => {
    return `banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addBanner = () => {
    const currentBanners = form.watch("config.banners") || [];
    form.setValue("config.banners", [
      ...currentBanners,
      {
        id: generateUniqueId(),
        label: "",
        imageUrl: "",
        link: ""
      }
    ]);
  };

  const removeBanner = (index: number) => {
    const currentBanners = form.watch("config.banners") || [];
    form.setValue(
      "config.banners",
      currentBanners.filter((_, i: number) => i !== index)
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    try {
      setIsLoading(true);
      const items = Array.from(banners);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      form.setValue("config.banners", items);
    } catch (error) {
      console.error('Error reordering banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Section */}
      <Card className="p-6">
        <div className="font-medium mb-4">Slider Settings</div>
        <FormField
          control={form.control}
          name="config.interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slide Interval (ms)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={isLoading}
                  placeholder="5000"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>

      <Separator />

      {/* Banners Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium">Banner Slides</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBanner}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="banner-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {banners.length === 0 ? (
                  <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed">
                    <div className="text-center text-muted-foreground">
                      <p>No banners added</p>
                      <p className="text-sm">Click the button above to add a banner</p>
                    </div>
                  </div>
                ) : (
                  banners.map((_, index: number) => (
                    <Draggable 
                      key={banners[index].id || index} 
                      draggableId={banners[index].id || index.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Card className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab opacity-50 hover:opacity-100"
                                >
                                  <Grip className="h-4 w-4" />
                                </div>
                                <h3 className="font-medium">Banner {index + 1}</h3>
                                {banners.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBanner(index)}
                                    className="ml-auto hover:text-destructive"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`config.banners.${index}.label`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Label</FormLabel>
                                      <FormControl>
                                        <Input 
                                          disabled={isLoading} 
                                          placeholder="Banner label" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`config.banners.${index}.link`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Link (Optional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          disabled={isLoading} 
                                          placeholder="https://example.com" 
                                          {...field} 
                                          value={field.value || ""}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`config.banners.${index}.imageUrl`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Image</FormLabel>
                                    <FormControl>
                                      <ImageUpload
                                        value={field.value ? [field.value] : []}
                                        disabled={isLoading}
                                        onChange={(url: string) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Card>
    </div>
  );
}
