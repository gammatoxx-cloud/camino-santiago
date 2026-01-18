import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 500; // Max width/height in pixels
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'profile-pictures';

/**
 * Validates an image file for type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Por favor sube un archivo de imagen JPG, PNG o WebP.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El tamaño del archivo debe ser menor a ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Resizes an image to a maximum size while maintaining aspect ratio
 */
export function resizeImage(file: File, maxSize: number = MAX_IMAGE_SIZE): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob (JPG format for consistency)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            // Create a new File from the blob
            const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          'image/jpeg',
          0.9 // Quality (0.9 = 90%)
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a profile picture to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Resize image if needed
  let fileToUpload = file;
  try {
    fileToUpload = await resizeImage(file);
  } catch (error) {
    console.warn('Failed to resize image, uploading original:', error);
    // Continue with original file if resize fails
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = fileToUpload.name.split('.').pop();
  const fileName = `${userId}/${timestamp}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública de la imagen subida');
  }

  return urlData.publicUrl;
}

/**
 * Deletes a profile picture from Supabase Storage
 * Extracts the file path from the public URL
 */
export async function deleteProfilePicture(url: string): Promise<void> {
  try {
    // Extract the file path from the URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/profile-pictures/{userId}/{filename}
    const urlParts = url.split('/');
    const fileNameIndex = urlParts.findIndex((part) => part === BUCKET_NAME);
    
    if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
      throw new Error('Invalid profile picture URL');
    }

    // Get the path after the bucket name (e.g., "userId/filename.jpg")
    const filePath = urlParts.slice(fileNameIndex + 1).join('/');

    // Delete from storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      // Don't throw error if file doesn't exist (already deleted)
      if (error.message && !error.message.includes('not found')) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    // Don't throw - allow operation to continue even if delete fails
  }
}

