import { Client, Account, Storage, ID, Permission, Role } from 'appwrite';

// Environment variable validation
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID');
}

if (!bucketId) {
  throw new Error('Missing NEXT_PUBLIC_APPWRITE_BUCKET_ID');
}

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(projectId);

export const account = new Account(client);
export const storage = new Storage(client);
export const serverStorage = storage;
export { bucketId };
export { ID, Permission, Role };

// Image URL masking and unmaksing helpers
export const getMaskedImageUrl = (fileId: string) => {
  return `/api/image-proxy/${fileId}`;
};

export const getFileIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/api\/image-proxy\/([^\/\?]+)/);
  return match ? match[1] : null;
};

// File preview helpers
export const getFilePreview = (fileId: string) => {
  return storage.getFilePreview(bucketId, fileId);
};

export const getFilePreviewUrl = (fileId: string) => {
  return storage.getFilePreview(bucketId, fileId).toString();
};

// File management helpers
export const uploadFile = async (file: File) => {
  try {
    const result = await storage.createFile(bucketId, ID.unique(), file);
    return result.$id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    await storage.deleteFile(bucketId, fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
