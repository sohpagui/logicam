import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ erreur: 'Aucun fichier reçu.' }, { status: 400 })
    }

    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', file)
    cloudinaryForm.append('upload_preset', 'logicam')
    cloudinaryForm.append('cloud_name', 'dded2qk4f')

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dded2qk4f/image/upload',
      {
        method: 'POST',
        body: cloudinaryForm
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Erreur Cloudinary:', data)
      return NextResponse.json({ erreur: 'Erreur Cloudinary.' }, { status: 500 })
    }

    return NextResponse.json({
      url: data.secure_url,
      public_id: data.public_id
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ erreur: 'Erreur lors de l\'upload.' }, { status: 500 })
  }
}