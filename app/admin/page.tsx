'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Agent = {
  id: string
  nom: string
  email: string
  telephone: string
  ville: string
  verifie: boolean
  note: number
  role: string
  created_at: string
}

export default function PageAdmin() {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [agents, setAgents] = useState<Agent[]>([])
  const [chargement, setChargement] = useState(true)
  const [onglet, setOnglet] = useState<'en_attente' | 'verifies' | 'tous'>('en_attente')

  useEffect(() => {
    if (!authChargement && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      verifierAdmin()
    }
  }, [user, authChargement])

  async function verifierAdmin() {
    const { data } = await supabase
      .from('agents')
      .select('role')
      .eq('email', user?.email)
      .single()

    if (!data || data.role !== 'admin') {
      router.push('/')
      return
    }

    chargerAgents()
  }

  async function chargerAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setAgents(data || [])
    }

    setChargement(false)
  }

  async function validerAgent(agentId: string) {
    await supabase
      .from('agents')
      .update({ verifie: true })
      .eq('id', agentId)

    setAgents(agents.map(a =>
      a.id === agentId ? { ...a, verifie: true } : a
    ))
  }

  async function rejeterAgent(agentId: string) {
    const confirmation = confirm('Voulez-vous vraiment rejeter cet agent ? Son compte sera supprimé.')
    if (!confirmation) return

    await supabase
      .from('agents')
      .delete()
      .eq('id', agentId)

    setAgents(agents.filter(a => a.id !== agentId))
  }

  const agentsEnAttente = agents.filter(a => !a.verifie && a.role !== 'admin')
  const agentsVerifies = agents.filter(a => a.verifie && a.role !== 'admin')
  const agentsAffiches = onglet === 'en_attente'
    ? agentsEnAttente
    : onglet === 'verifies'
    ? agentsVerifies
    : agents.filter(a => a.role !== 'admin')

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-800 tracking-tight">
          LogiCam
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Espace administration</span>
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* STATISTIQUES */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-orange-500">{agentsEnAttente.length}</p>
            <p className="text-xs text-gray-500 mt-1">En attente de vérification</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-green-600">{agentsVerifies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Agents vérifiés</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">{agents.filter(a => a.role !== 'admin').length}</p>
            <p className="text-xs text-gray-500 mt-1">Total agents</p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setOnglet('en_attente')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'en_attente'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            En attente
            {agentsEnAttente.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {agentsEnAttente.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setOnglet('verifies')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'verifies'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Vérifiés
          </button>
          <button
            onClick={() => setOnglet('tous')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'tous'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Tous les agents
          </button>
        </div>

        {/* LISTE AGENTS */}
        {agentsAffiches.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">Aucun agent dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agentsAffiches.map((agent) => (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg">
                    {agent.nom.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{agent.nom}</p>
                    <p className="text-xs text-gray-500">{agent.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{agent.telephone} — {agent.ville}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    agent.verifie
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {agent.verifie ? 'Vérifié' : 'En attente'}
                  </span>

                  {!agent.verifie && (
                    <button
                      onClick={() => validerAgent(agent.id)}
                      className="text-xs bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium"
                    >
                      Valider
                    </button>
                  )}

                  <button
                    onClick={() => rejeterAgent(agent.id)}
                    className="text-xs border border-red-300 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
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