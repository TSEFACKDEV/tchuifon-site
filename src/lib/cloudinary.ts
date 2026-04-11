import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Types de fichiers autorisés par dossier
export const ALLOWED_TYPES: Record<string, string[]> = {
  profiles: ['image/jpeg', 'image/png', 'image/webp'],
  publications: ['application/pdf'],
  courses: ['application/pdf'],
  cv: ['application/pdf'],
  collaborators: ['image/jpeg', 'image/png', 'image/webp'],
}

// Upload depuis un Buffer (server-side)
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image',
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `tchuifon/${folder}`,
        resource_type: resourceType,
        public_id: publicId,
        overwrite: true,
        // Pour les images : optimisation automatique
        ...(resourceType === 'image' && {
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        }),
      },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(buffer)
  })
}

// Supprimer un fichier
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
) {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

// Générer une URL transformée (resize, crop...)
export function getOptimizedUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string }
) {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  })
}