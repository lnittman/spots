import { put, list, del, PutBlobResult } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob storage
 * @param fileName The name/path of the file
 * @param data The file data as string, ArrayBuffer, or Blob
 * @param options Optional configuration
 * @returns The upload result including the public URL
 */
export async function uploadToBlob(
  fileName: string, 
  data: string | ArrayBuffer | Blob,
  options?: { access?: "public"; addRandomSuffix?: boolean; cacheControlMaxAge?: number }
): Promise<PutBlobResult> {
  try {
    const defaultOptions = { 
      access: "public" as const,
      addRandomSuffix: false
    };
    
    const combinedOptions = { ...defaultOptions, ...options };
    
    const result = await put(fileName, data, combinedOptions);
    return result;
  } catch (error) {
    console.error("Error uploading to Blob storage:", error);
    throw error;
  }
}

/**
 * List blobs with a given prefix
 * @param prefix The prefix to filter by
 * @returns List of blobs
 */
export async function listBlobs(prefix: string) {
  try {
    const blobs = await list({ prefix });
    return blobs;
  } catch (error) {
    console.error("Error listing blobs:", error);
    throw error;
  }
}

/**
 * Delete a blob
 * @param url The URL of the blob to delete
 */
export async function deleteBlob(url: string) {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting blob:", error);
    throw error;
  }
}

/**
 * Example usage
 */
export async function exampleBlobUsage() {
  const { url } = await uploadToBlob(
    'articles/example.txt', 
    'This is an example text file!', 
    { 
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: 3600 // 1 hour
    }
  );
  
  return url;
} 