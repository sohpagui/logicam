'use client'

import { useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NavBar from '../../components/NavBar'

export default function PageContact({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')

  async function envoyerMessage() {
    if (!nom || !email || !message) {
      alert('Veuillez remplir tous les champs.')
      return
    }

    setEnvoi('chargement')

    const { data: annonce } = await supabase
      .from('annonces')
      .select('agent_id')
      .eq('id', id)
      .single()

    if (!annonce) {
      setEnvoi('erreur')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        contenu: message,
        expediteur_nom: nom,
        expediteur_email: email,
        agent_id: annonce.agent_id,
        annonce_id: id
      })

    if (error) {
      console.error(error)
      setEnvoi('erreur')
    } else {
      setEnvoi('succes')
    }
  }

  if (envoi === 'succes') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-lg p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Message envoyé</h2>
          <p className="text-gray-500 text-sm mb-6">
            L'agent a bien reçu votre message. Il vous contactera dans les plus brefs délais.
          </p>
          <Link href="/" className="block w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition">
            Retour aux annonces
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVIGATION */}
      <NavBar />

      <div className="max-w-lg mx-auto px-6 py-14">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Contacter l'agent</h1>
        <p className="text-gray-500 text-sm mb-8">
          Votre message sera transmis directement à l'agent responsable de cette annonce.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6">

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre nom complet
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : Pascal Sohpagui"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex : pascal@gmail.com"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour, je suis intéressé par ce logement. Pouvez-vous me donner plus d'informations ?"
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {envoi === 'erreur' && (
            <p className="text-red-500 text-sm mb-4">
              Une erreur s'est produite. Veuillez réessayer.
            </p>
          )}

          <button
            onClick={envoyerMessage}
            disabled={envoi === 'chargement'}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {envoi === 'chargement' ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Vos coordonnées ne seront partagées qu'avec l'agent concerné.
          </p>
        </div>
      </div>

      <footer className="bg-blue-900 py-8 px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold text-lg">LogiCam</span>
          <p className="text-blue-300 text-sm">La plateforme immobilière de confiance au Cameroun</p>
          <p className="text-blue-400 text-xs">© 2026 LogiCam</p>
        </div>
      </footer>

    </main>
  )
}