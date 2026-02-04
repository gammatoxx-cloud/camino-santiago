import { supabase } from './supabase';
import { validateImageFile, resizeImage } from './imageUpload';

const BUCKET_NAME = 'team-pictures';

/**
 * Uploads a team picture to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadTeamPicture(teamId: string, file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let fileToUpload = file;
  try {
    fileToUpload = await resizeImage(file);
  } catch (error) {
    console.warn('Failed to resize image, uploading original:', error);
  }

  const timestamp = Date.now();
  const fileExt = fileToUpload.name.split('.').pop();
  const fileName = `${teamId}/${timestamp}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error('No se pudo obtener la URL pública de la imagen subida');
  }

  return urlData.publicUrl;
}

/**
 * Deletes a team picture from Supabase Storage
 * Extracts the file path from the public URL
 */
export async function deleteTeamPicture(url: string): Promise<void> {
  try {
    const urlParts = url.split('/');
    const fileNameIndex = urlParts.findIndex((part) => part === BUCKET_NAME);

    if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
      return;
    }

    const filePath = urlParts.slice(fileNameIndex + 1).join('/');

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      if (error.message && !error.message.includes('not found')) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error deleting team picture:', error);
  }
}
