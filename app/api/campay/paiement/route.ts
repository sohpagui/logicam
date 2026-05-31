import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function getToken() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAY_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.CAMPAY_USERNAME,
      password: process.env.CAMPAY_PASSWORD
    })
  })
  const data = await response.json()
  return data.token
}

export async function POST(request: NextRequest) {
  try {
    const { annonce_id, agent_email, telephone, duree_jours } = await request.json()

    if (!annonce_id || !agent_email || !telephone || !duree_jours) {
      return NextResponse.json({ erreur: 'Données manquantes.' }, { status: 400 })
    }

    const montant = duree_jours === 7 ? 500 : 1500

    const token = await getToken()

    if (!token) {
      return NextResponse.json({ erreur: 'Impossible de se connecter à CamPay.' }, { status: 500 })
    }

    const reference = `LOGICAM-${Date.now()}`

    const response = await fetch(`${process.env.NEXT_PUBLIC_CAMPAY_URL}/collect/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        amount: montant.toString(),
        from: telephone,
        description: `Boost annonce LogiCam - ${duree_jours} jours`,
        external_reference: reference
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Erreur CamPay:', data)
      return NextResponse.json({ erreur: 'Erreur lors de l\'initiation du paiement.' }, { status: 500 })
    }

    await supabase.from('boosts').insert({
      annonce_id,
      agent_email,
      montant,
      duree_jours,
      statut: 'en_attente',
      reference_campay: data.reference || reference
    })

    return NextResponse.json({
      succes: true,
      reference: data.reference || reference,
      ussd_code: data.ussd_code,
      message: 'Demande de paiement envoyée. Confirmez sur votre téléphone.'
    })

  } catch (error) {
    console.error('Erreur paiement:', error)
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 })
  }
}