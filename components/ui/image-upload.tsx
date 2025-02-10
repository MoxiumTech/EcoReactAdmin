"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { FileRejection, useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (url: string) => void;
  value: string[];
}

interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || isUploading) return;

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          try {
            const response = JSON.parse(xhr.responseText) as UploadResponse;
            if (xhr.status === 401) {
              reject(new Error('Please sign in as admin to upload images'));
            } else if (!response.success) {
              reject(new Error(response.message || 'Upload failed'));
            } else if (response.url) {
              onChange(response.url);
              toast.success('Image uploaded successfully');
              resolve();
            } else {
              reject(new Error('Invalid response from server'));
            }
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error occurred'));
        };

        xhr.send(formData);
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [disabled, isUploading, onChange]);

  const handleDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (!rejection) return;

    const error = rejection.errors[0];
    switch (error?.code) {
      case "file-too-large":
        toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        break;
      case "file-invalid-type":
        toast.error("Invalid file type. Please upload an image");
        break;
      default:
        toast.error(error?.message || "Error uploading file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: handleDropRejected,
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp']
    },
    multiple: false,
    disabled: disabled || isUploading,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="space-y-4 w-full">
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-all",
          isDragActive 
            ? "border-primary bg-secondary/10" 
            : "border-gray-200 hover:border-primary",
          (disabled || isUploading) 
            ? "opacity-50 cursor-not-allowed" 
            : "cursor-pointer hover:border-primary"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <ImagePlus className={cn(
            "h-10 w-10 transition-colors",
            isDragActive ? "text-primary" : "text-gray-400"
          )} />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="text-base font-medium">
              {isDragActive ? "Drop the image here" : "Drop your image here"}
            </p>
            <p>or click to browse</p>
          </div>
          {isUploading && (
            <div className="w-full max-w-xs mt-4">
              <div className="bg-secondary rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url) => (
            <div 
              key={url} 
              className="group relative aspect-square rounded-lg overflow-hidden bg-secondary/20"
            >
              <Image
                fill
                src={url}
                alt="Upload preview"
                className="object-cover"
              />
              <button
                onClick={async () => {
                  try {
                    // Delete from Appwrite storage
                    const response = await fetch('/api/upload', {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ url }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to delete image');
                    }

                    // Only remove from UI if deletion was successful
                    onRemove(url);
                    toast.success('Image deleted successfully');
                  } catch (error) {
                    console.error('Error deleting image:', error);
                    toast.error('Failed to delete image');
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
