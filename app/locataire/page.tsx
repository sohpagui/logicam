'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../components/NavBar'

type Message = {
  id: string
  contenu: string
  created_at: string
  annonces: { id: string; titre: string; ville: string; quartier: string; prix: number } | null
  agents: { nom: string; verifie: boolean } | null
}

type Locataire = {
  id: string
  nom: string
  email: string
  telephone: string
  ville: string
}

export default function PageDashboardLocataire() {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [locataire, setLocataire] = useState<Locataire | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!authChargement && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      chargerDonnees()
    }
  }, [user, authChargement])

  async function chargerDonnees() {
    if (!user) return

    const { data: locataireData } = await supabase
      .from('locataires')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!locataireData) {
      router.push('/')
      return
    }

    setLocataire(locataireData)

    const { data: messagesData } = await supabase
      .from('messages')
      .select('*, annonces(id, titre, ville, quartier, prix), agents(nom, verifie)')
      .eq('expediteur_email', user.email)
      .order('created_at', { ascending: false })

    setMessages(messagesData || [])
    setChargement(false)
  }

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
  }

  if (!locataire) return null

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* PROFIL LOCATAIRE */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
              {locataire.nom.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{locataire.nom}</h2>
              <p className="text-sm text-gray-500">{locataire.email} — {locataire.ville}</p>
              <p className="text-xs text-gray-400 mt-0.5">{locataire.telephone}</p>
            </div>
          </div>
          <Link
            href="/annonces"
            className="bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-900 transition"
          >
            Chercher un logement
          </Link>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">{messages.length}</p>
            <p className="text-xs text-gray-500 mt-1">Messages envoyés</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">
              {new Set(messages.map(m => m.annonces?.id).filter(Boolean)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">Annonces contactées</p>
          </div>
        </div>

        {/* HISTORIQUE MESSAGES */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Mes messages envoyés
          </h2>

          {messages.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-400 text-sm mb-3">
                Vous n'avez encore contacté aucun agent.
              </p>
              <Link
                href="/annonces"
                className="text-blue-800 font-medium hover:underline text-sm"
              >
                Parcourir les annonces
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {message.annonces && (
                        <Link
                          href={`/annonces/${message.annonces.id}`}
                          className="font-semibold text-blue-800 text-sm hover:underline"
                        >
                          {message.annonces.titre}
                        </Link>
                      )}
                      {message.annonces && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {message.annonces.quartier}, {message.annonces.ville} —{' '}
                          {message.annonces.prix.toLocaleString('fr-FR')} FCFA / mois
                        </p>
                      )}
                      {message.agents && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Agent : {message.agents.nom}
                          {message.agents.verifie && (
                            <span className="ml-2 text-green-600 font-medium">vérifié</span>
                          )}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                      {new Date(message.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-md p-3">
                    {message.contenu}
                  </p>
                </div>
              ))}
            </div>
          )}
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