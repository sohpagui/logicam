import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Webhook CamPay reçu:', data)

    const { reference, status } = data

    if (!reference) {
      return NextResponse.json({ erreur: 'Référence manquante.' }, { status: 400 })
    }

    if (status === 'SUCCESSFUL') {
      const { data: boost, error } = await supabase
        .from('boosts')
        .select('*')
        .eq('reference_campay', reference)
        .single()

      if (error || !boost) {
        return NextResponse.json({ erreur: 'Boost introuvable.' }, { status: 404 })
      }

      await supabase
        .from('boosts')
        .update({ statut: 'paye' })
        .eq('reference_campay', reference)

      const dateExpiration = new Date()
      dateExpiration.setDate(dateExpiration.getDate() + boost.duree_jours)

      await supabase
        .from('annonces')
        .update({
          booste: true,
          boost_expire_le: dateExpiration.toISOString()
        })
        .eq('id', boost.annonce_id)

    } else if (status === 'FAILED') {
      await supabase
        .from('boosts')
        .update({ statut: 'echoue' })
        .eq('reference_campay', reference)
    }

    return NextResponse.json({ succes: true })

  } catch (error) {
    console.error('Erreur webhook:', error)
    return NextResponse.json({ erreur: 'Erreur serveur.' }, { status: 500 })
  }
}