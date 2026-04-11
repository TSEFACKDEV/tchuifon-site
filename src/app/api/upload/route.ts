import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadToCloudinary, deleteFromCloudinary, ALLOWED_TYPES } from '@/lib/cloudinary'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN', 'COLLABORATOR'])
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) ?? 'publications'

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    // Vérifier le dossier
    const allowedFolders = Object.keys(ALLOWED_TYPES)
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ error: 'Dossier invalide' }, { status: 400 })
    }

    // Vérifier le type MIME
    const allowedMimes = ALLOWED_TYPES[folder]
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé pour ce dossier. Acceptés : ${allowedMimes.join(', ')}` },
        { status: 400 }
      )
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 MB)' },
        { status: 400 }
      )
    }

    // Convertir en Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Déterminer le resource_type Cloudinary
    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image'

    // Uploader
    const { url, publicId } = await uploadToCloudinary(buffer, folder, resourceType)

    return NextResponse.json({ url, publicId })
  } catch (error) {
    console.error('[UPLOAD]', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

// DELETE /api/upload — supprimer un fichier
export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req, ['ADMIN'])
  if (auth instanceof NextResponse) return auth

  try {
    const { publicId, resourceType } = await req.json()

    if (!publicId) {
      return NextResponse.json({ error: 'publicId manquant' }, { status: 400 })
    }

    await deleteFromCloudinary(publicId, resourceType ?? 'image')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UPLOAD_DELETE]', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}