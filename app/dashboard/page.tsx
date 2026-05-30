'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../components/NavBar'

type Annonce = {
  id: string
  titre: string
  quartier: string
  ville: string
  prix: number
  statut: string
  created_at: string
}

type Message = {
  id: string
  contenu: string
  expediteur_nom: string
  expediteur_email: string
  created_at: string
  lu: boolean
  annonces: { titre: string } | null
}

type Agent = {
  id: string
  nom: string
  email: string
  telephone: string
  ville: string
  verifie: boolean
  note: number
}

export default function PageDashboard() {
  const { user, chargement: authChargement, seDeconnecter } = useAuth()
  const router = useRouter()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [chargement, setChargement] = useState(true)
  const [onglet, setOnglet] = useState<'annonces' | 'messages'>('annonces')

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

    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!agentData) {
      router.push('/')
      return
    }

    setAgent(agentData)

    const { data: annoncesData } = await supabase
      .from('annonces')
      .select('*')
      .eq('agent_id', agentData.id)
      .order('created_at', { ascending: false })

    setAnnonces(annoncesData || [])

    const { data: messagesData } = await supabase
      .from('messages')
      .select('*, annonces(titre)')
      .eq('agent_id', agentData.id)
      .order('created_at', { ascending: false })

    setMessages(messagesData || [])
    setChargement(false)
  }

  async function marquerLu(messageId: string) {
    await supabase
      .from('messages')
      .update({ lu: true })
      .eq('id', messageId)

    setMessages(messages.map(m =>
      m.id === messageId ? { ...m, lu: true } : m
    ))
  }

  async function supprimerAnnonce(annonceId: string) {
    const confirmation = confirm('Voulez-vous vraiment supprimer cette annonce ?')
    if (!confirmation) return

    await supabase
      .from('annonces')
      .delete()
      .eq('id', annonceId)

    setAnnonces(annonces.filter(a => a.id !== annonceId))
  }

  async function gererDeconnexion() {
    await seDeconnecter()
    router.push('/')
  }

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
  }

  if (!agent) return null

  return (
    <main className="min-h-screen bg-gray-50">
     <NavBar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* PROFIL AGENT */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
              {agent.nom.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{agent.nom}</h2>
              <p className="text-sm text-gray-500">{agent.email} — {agent.ville}</p>
              <div className="flex items-center gap-2 mt-1">
                {agent.verifie ? (
                  <span className="text-xs text-green-600 font-medium">Agent vérifié</span>
                ) : (
                  <span className="text-xs text-yellow-600 font-medium">Vérification en attente</span>
                )}
                {agent.note > 0 && (
                  <span className="text-xs text-gray-400">— Note : {agent.note}/5</span>
                )}
              </div>
            </div>
          </div>
          <Link
            href="/publier"
            className="bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-900 transition"
          >
            Nouvelle annonce
          </Link>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">{annonces.length}</p>
            <p className="text-xs text-gray-500 mt-1">Annonces publiées</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">
              {annonces.filter(a => a.statut === 'disponible').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Annonces actives</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">
              {messages.filter(m => !m.lu).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Messages non lus</p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setOnglet('annonces')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'annonces'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Mes annonces
          </button>
          <button
            onClick={() => setOnglet('messages')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'messages'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Messages reçus
            {messages.filter(m => !m.lu).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {messages.filter(m => !m.lu).length}
              </span>
            )}
          </button>
        </div>

        {/* CONTENU ONGLET ANNONCES */}
        {onglet === 'annonces' && (
          <div>
            {annonces.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Vous n'avez pas encore publié d'annonce.</p>
                <Link href="/publier" className="text-blue-800 font-medium hover:underline mt-2 block text-sm">
                  Publier ma première annonce
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {annonces.map((annonce) => (
                  <div key={annonce.id} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{annonce.titre}</h3>
                      <p className="text-xs text-gray-500 mt-1">{annonce.quartier}, {annonce.ville}</p>
                      <p className="text-blue-800 font-bold text-sm mt-1">
                        {annonce.prix.toLocaleString('fr-FR')} FCFA / mois
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        annonce.statut === 'disponible'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {annonce.statut === 'disponible' ? 'Disponible' : 'Bientôt disponible'}
                      </span>
                      <Link
                        href={`/annonces/${annonce.id}`}
                        className="text-xs text-blue-800 hover:underline font-medium"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => supprimerAnnonce(annonce.id)}
                        className="text-xs text-red-500 hover:underline font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET MESSAGES */}
        {onglet === 'messages' && (
          <div>
            {messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Aucun message reçu pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`bg-white border rounded-lg p-5 ${
                      !message.lu ? 'border-blue-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{message.expediteur_nom}</p>
                        <p className="text-xs text-gray-400">{message.expediteur_email}</p>
                        {message.annonces && (
                          <p className="text-xs text-blue-800 mt-1">
                            Concernant : {message.annonces.titre}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {!message.lu && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Nouveau
                          </span>
                        )}
                        {!message.lu && (
                          <button
                            onClick={() => marquerLu(message.id)}
                            className="text-xs text-gray-500 hover:text-gray-800 hover:underline"
                          >
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{message.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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