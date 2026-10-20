import { supabase, isSupabaseConfigured } from './supabase';
import { compressImageFile } from '../components/MultiImageDropzone';

export const MEDIA_BUCKET = 'media';

export interface StorageUploadResult {
  url: string;
  isCloudStorage: boolean;
  error?: string;
  bucketMissing?: boolean;
}

/**
 * Checks if the public media storage bucket exists on the Supabase project.
 */
export async function checkMediaBucketStatus(): Promise<{ exists: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { exists: false, error: 'Supabase is not configured' };
  }
  try {
    const { data, error } = await supabase.storage.getBucket(MEDIA_BUCKET);
    if (error) {
      if (error.message?.includes('not found') || (error as any).statusCode === '404' || (error as any).code === 'NoSuchBucket') {
        return { exists: false, error: `Bucket '${MEDIA_BUCKET}' does not exist in Supabase project.` };
      }
      return { exists: false, error: error.message };
    }
    return { exists: Boolean(data) };
  } catch (err: any) {
    return { exists: false, error: err?.message || 'Storage check failed' };
  }
}

/**
 * Uploads an image or video file directly to the Supabase Storage public 'media' bucket.
 * If the bucket doesn't exist yet or upload fails, falls back safely to optimized local data URL,
 * and returns clear diagnostic instructions for the admin.
 */
export async function uploadMediaFile(
  file: File, 
  folder: string = 'showcase'
): Promise<StorageUploadResult> {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  // Try uploading to Supabase Storage if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const timestamp = Date.now();
      const filePath = `${folder}/${timestamp}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from(MEDIA_BUCKET)
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Optionally record in media_items table in Supabase
        try {
          await supabase.from('media_items').insert([{
            file_name: file.name,
            file_url: publicUrl,
            file_type: isVideo ? 'video' : 'image',
            file_size: file.size
          }]);
        } catch {
          // Table may be pending migration
        }

        return {
          url: publicUrl,
          isCloudStorage: true
        };
      }

      // Check if failure is due to missing bucket
      const isMissingBucket = error?.message?.includes('not found') || 
                              (error as any)?.statusCode === '404' || 
                              (error as any)?.code === 'NoSuchBucket';

      const errorMsg = isMissingBucket
        ? `Storage bucket '${MEDIA_BUCKET}' does not exist in Supabase yet. Please run supabase/schema.sql in the Supabase SQL Editor.`
        : (error?.message || 'Storage upload error');

      console.warn('Supabase storage upload notice:', errorMsg);

      // Fallback to local data URL so the user's action doesn't get blocked
      let fallbackUrl = '';
      if (isImage) {
        fallbackUrl = await compressImageFile(file);
      } else {
        fallbackUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      return {
        url: fallbackUrl,
        isCloudStorage: false,
        bucketMissing: isMissingBucket,
        error: errorMsg
      };
    } catch (err: any) {
      console.warn('Storage processing exception:', err);
    }
  }

  // Local fallback if Supabase not configured or encountered exception
  let fallbackUrl = '';
  if (isImage) {
    fallbackUrl = await compressImageFile(file);
  } else {
    fallbackUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  return {
    url: fallbackUrl,
    isCloudStorage: false,
    error: 'Supabase storage is not configured.'
  };
}

/**
 * Removes an object from Supabase storage if it was stored there.
 */
export async function deleteMediaFileFromStorage(fileUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase || !fileUrl) {
    return { success: true };
  }
  // Check if URL belongs to Supabase storage
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  if (!fileUrl.includes(marker)) {
    return { success: true }; // external or local data URL
  }

  try {
    const filePath = fileUrl.split(marker)[1];
    if (filePath) {
      const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([decodeURIComponent(filePath)]);
      if (error) return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
