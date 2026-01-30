import { supabase } from './supabase';
import type { UserProfile } from '../types';

export interface GalleryImage {
  id: string;
  user_id: string;
  album_month: number;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  like_count?: number;
  user_liked?: boolean;
  comment_count?: number;
}

export interface GalleryLike {
  id: string;
  image_id: string;
  user_id: string;
  created_at: string;
  user?: UserProfile;
}

export interface GalleryComment {
  id: string;
  image_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}

const BUCKET_NAME = 'gallery-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for gallery images
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validates an image file for type and size
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
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
 * Uploads a gallery image to Supabase Storage
 */
async function uploadImageToStorage(month: number, userId: string, file: File): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${month}/${userId}/${timestamp}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error('Error al obtener la URL pública de la imagen');
  }

  return urlData.publicUrl;
}

/**
 * Deletes an image from Supabase Storage
 */
async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/');
    const fileNameIndex = urlParts.findIndex((part) => part === BUCKET_NAME);
    
    if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
      throw new Error('URL de imagen inválida');
    }

    // Get the path after the bucket name (e.g., "month/user_id/filename.jpg")
    const filePath = urlParts.slice(fileNameIndex + 1).join('/');

    // Delete from storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      if (!error.message.includes('not found')) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error al eliminar imagen del almacenamiento:', error);
    throw error;
  }
}

/**
 * Fetches all images for a specific month with user profiles
 */
export async function fetchAlbumImages(month: number): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select(`
      *,
      user:profiles!gallery_images_user_id_fkey(id, name, avatar_url)
    `)
    .eq('album_month', month)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error al cargar las imágenes: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    ...item,
    user: item.user || null,
  }));
}

/**
 * Uploads a gallery image
 */
export async function uploadGalleryImage(
  month: number,
  file: File,
  caption?: string
): Promise<GalleryImage> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // Upload to storage
  const imageUrl = await uploadImageToStorage(month, user.id, file);

  // Save metadata to database
  const { data, error } = await supabase
    .from('gallery_images')
    .insert({
      user_id: user.id,
      album_month: month,
      image_url: imageUrl,
      caption: caption || null,
    } as any)
    .select(`
      *,
      user:profiles!gallery_images_user_id_fkey(id, name, avatar_url)
    `)
    .single();

  if (error) {
    // Try to delete from storage if database insert fails
    try {
      await deleteImageFromStorage(imageUrl);
    } catch (deleteError) {
      console.error('Error al eliminar imagen después de fallo en BD:', deleteError);
    }
    throw new Error(`Error al guardar la imagen: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo guardar la imagen');
  }

  const result = data as any;
  return {
    ...result,
    user: result.user || null,
  } as GalleryImage;
}

/**
 * Updates a gallery image caption (only by owner)
 */
export async function updateGalleryImageCaption(
  imageId: string,
  caption: string | null
): Promise<GalleryImage> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // First check ownership
  const { data: existingImage, error: fetchError } = await supabase
    .from('gallery_images')
    .select('user_id')
    .eq('id', imageId)
    .single();

  if (fetchError || !existingImage) {
    throw new Error('Imagen no encontrada');
  }

  const image = existingImage as { user_id: string };
  if (image.user_id !== user.id) {
    throw new Error('No tienes permiso para editar esta imagen');
  }

  // Update caption
  const updateData = { caption: caption || null, updated_at: new Date().toISOString() };
  const { data, error } = await (supabase
    .from('gallery_images') as any)
    .update(updateData)
    .eq('id', imageId)
    .select(`
      *,
      user:profiles!gallery_images_user_id_fkey(id, name, avatar_url)
    `)
    .single();

  if (error) {
    throw new Error(`Error al actualizar la descripción: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo actualizar la imagen');
  }

  const result = data as any;
  return {
    ...result,
    user: result.user || null,
  } as GalleryImage;
}

/**
 * Deletes a gallery image (only by owner)
 */
export async function deleteGalleryImage(imageId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  // First, get the image to check ownership and get the URL
  const { data: imageData, error: fetchError } = await supabase
    .from('gallery_images')
    .select('image_url, user_id')
    .eq('id', imageId)
    .single();

  if (fetchError || !imageData) {
    throw new Error('Imagen no encontrada');
  }

  const image = imageData as { image_url: string; user_id: string };
  if (image.user_id !== user.id) {
    throw new Error('No tienes permiso para eliminar esta imagen');
  }

  // Delete from database (cascade will handle likes/comments)
  const { error: deleteError } = await supabase
    .from('gallery_images')
    .delete()
    .eq('id', imageId);

  if (deleteError) {
    throw new Error(`Error al eliminar la imagen: ${deleteError.message}`);
  }

  // Delete from storage
  try {
    await deleteImageFromStorage(image.image_url);
  } catch (storageError) {
    console.error('Error al eliminar imagen del almacenamiento:', storageError);
    // Don't throw - image is already deleted from DB
  }
}

/**
 * Fetches like count and user's like status for an image
 */
export async function fetchImageLikes(imageId: string): Promise<{
  count: number;
  userLiked: boolean;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [likesResult, userLikeResult] = await Promise.all([
    supabase.from('gallery_likes').select('id', { count: 'exact' }).eq('image_id', imageId),
    user
      ? supabase
          .from('gallery_likes')
          .select('id')
          .eq('image_id', imageId)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (likesResult.error) {
    throw new Error(`Error al cargar los likes: ${likesResult.error.message}`);
  }

  return {
    count: likesResult.count || 0,
    userLiked: !!userLikeResult.data,
  };
}

/**
 * Likes an image
 */
export async function likeImage(imageId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabase.from('gallery_likes').insert({
    image_id: imageId,
    user_id: user.id,
  } as any);

  if (error) {
    // If duplicate, ignore (user already liked)
    if (error.code !== '23505') {
      throw new Error(`Error al dar like: ${error.message}`);
    }
  }
}

/**
 * Unlikes an image
 */
export async function unlikeImage(imageId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabase
    .from('gallery_likes')
    .delete()
    .eq('image_id', imageId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Error al quitar like: ${error.message}`);
  }
}

/**
 * Fetches comments for an image with user profiles
 */
export async function fetchImageComments(imageId: string): Promise<GalleryComment[]> {
  const { data, error } = await supabase
    .from('gallery_comments')
    .select(`
      *,
      user:profiles!gallery_comments_user_id_fkey(id, name, avatar_url)
    `)
    .eq('image_id', imageId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error al cargar los comentarios: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    ...item,
    user: item.user || null,
  }));
}

/**
 * Adds a comment to an image
 */
export async function addComment(imageId: string, content: string): Promise<GalleryComment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  if (!content.trim()) {
    throw new Error('El comentario no puede estar vacío');
  }

  const { data, error } = await supabase
    .from('gallery_comments')
    .insert({
      image_id: imageId,
      user_id: user.id,
      content: content.trim(),
    } as any)
    .select(`
      *,
      user:profiles!gallery_comments_user_id_fkey(id, name, avatar_url)
    `)
    .single();

  if (error) {
    throw new Error(`Error al agregar comentario: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo agregar el comentario');
  }

  const result = data as any;
  return {
    ...result,
    user: result.user || null,
  } as GalleryComment;
}

/**
 * Deletes a comment (only by owner)
 */
export async function deleteComment(commentId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabase
    .from('gallery_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Error al eliminar comentario: ${error.message}`);
  }
}

/**
 * Gets image counts per month (1-12)
 */
export async function getAlbumImageCounts(): Promise<Record<number, number>> {
  const { data, error } = await supabase
    .from('gallery_images')
    .select('album_month');

  if (error) {
    throw new Error(`Error al cargar los conteos: ${error.message}`);
  }

  const images = (data || []) as Array<{ album_month: number }>;

  // Initialize counts for all months (1-12)
  const counts: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) {
    counts[i] = 0;
  }

  // Count images by month
  for (const item of images) {
    const month = item.album_month;
    if (month >= 1 && month <= 12) {
      counts[month] = (counts[month] || 0) + 1;
    }
  }

  return counts;
}

