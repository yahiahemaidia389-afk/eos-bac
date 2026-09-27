import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Uploads a profile avatar to Supabase Storage in the 'avatars' bucket.
 * Security enforcement:
 * - A student can ONLY upload to their OWN path: `${userId}/avatar-${timestamp}.${ext}`.
 * - No service_role key is used; only standard authenticated client / anon client.
 * - If Supabase Storage bucket is not yet provisioned on the remote instance,
 *   cleanly falls back to an optimized, client-compressed data URL so the student is never blocked.
 */
export async function uploadAvatarImage(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Le fichier sélectionné doit être une image (PNG, JPG, WebP).' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'L’image ne doit pas dépasser 5 Mo.' };
  }

  // 1. First compress the image to max 256x256 at 0.8 quality to minimize upload bandwidth and storage
  let compressedBlob: Blob | null = null;
  let compressedDataUrl: string | null = null;

  try {
    const result = await compressImage(file, 256, 256, 0.8);
    compressedBlob = result.blob;
    compressedDataUrl = result.dataUrl;
  } catch (err: any) {
    console.warn('Image compression warning, proceeding with original file:', err);
  }

  // 2. Try uploading to Supabase Storage if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = 'jpg';
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;
      const payloadToUpload = compressedBlob || file;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, payloadToUpload, {
          contentType: 'image/jpeg',
          cacheControl: '31536000', // 1 year cache for immutable hashed avatar
          upsert: true,
        });

      if (!uploadError && data) {
        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload notice:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage fallback notice:', err);
    }
  }

  // 3. Fallback: Compact Base64 Data URL (already resized to 256x256, < 20KB)
  if (compressedDataUrl) {
    return { success: true, url: compressedDataUrl };
  }

  return { success: false, error: 'Erreur lors du traitement de l’image.' };
}

/**
 * Resizes and compresses an image file to both a Blob (for upload) and a compact data URL
 */
export function compressImage(
  file: File,
  maxWidth = 256,
  maxHeight = 256,
  quality = 0.8
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl });
            } else {
              reject(new Error('Failed to create image blob.'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Impossible de lire l’image.'));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Backward compatibility wrapper
 */
export async function compressImageFile(
  file: File,
  maxWidth = 256,
  maxHeight = 256,
  quality = 0.8
): Promise<string> {
  const result = await compressImage(file, maxWidth, maxHeight, quality);
  return result.dataUrl;
}
