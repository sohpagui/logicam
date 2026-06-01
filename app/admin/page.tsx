'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../components/NavBar'

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

type DemandeVerification = {
  id: string
  agent_email: string
  photo_cni: string
  photo_cni_verso: string
  photo_selfie: string
  photo_document: string | null
  description: string | null
  statut: string
  created_at: string
}

export default function PageAdmin() {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [agents, setAgents] = useState<Agent[]>([])
  const [demandes, setDemandes] = useState<DemandeVerification[]>([])
  const [chargement, setChargement] = useState(true)
  const [onglet, setOnglet] = useState<'en_attente' | 'verifies' | 'tous' | 'dossiers'>('en_attente')
  const [demandeSelectionnee, setDemandeSelectionnee] = useState<DemandeVerification | null>(null)

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

    chargerDonnees()
  }

  async function chargerDonnees() {
    const { data: agentsData } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })

    setAgents(agentsData || [])

    const { data: demandesData } = await supabase
      .from('demandes_verification')
      .select('*')
      .order('created_at', { ascending: false })

    setDemandes(demandesData || [])
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
    const confirmation = confirm('Voulez-vous vraiment supprimer cet agent ?')
    if (!confirmation) return

    await supabase.from('agents').delete().eq('id', agentId)
    setAgents(agents.filter(a => a.id !== agentId))
  }

  async function validerDossier(demande: DemandeVerification) {
    await supabase
      .from('demandes_verification')
      .update({ statut: 'approuve' })
      .eq('id', demande.id)

    await supabase
      .from('agents')
      .update({ verifie: true })
      .eq('email', demande.agent_email)

    setDemandes(demandes.map(d =>
      d.id === demande.id ? { ...d, statut: 'approuve' } : d
    ))
    setAgents(agents.map(a =>
      a.email === demande.agent_email ? { ...a, verifie: true } : a
    ))
    setDemandeSelectionnee(null)
  }

  async function rejeterDossier(demande: DemandeVerification) {
    const confirmation = confirm('Voulez-vous rejeter ce dossier ?')
    if (!confirmation) return

    await supabase
      .from('demandes_verification')
      .update({ statut: 'rejete' })
      .eq('id', demande.id)

    setDemandes(demandes.map(d =>
      d.id === demande.id ? { ...d, statut: 'rejete' } : d
    ))
    setDemandeSelectionnee(null)
  }

  const agentsEnAttente = agents.filter(a => !a.verifie && a.role !== 'admin')
  const agentsVerifies = agents.filter(a => a.verifie && a.role !== 'admin')
  const agentsAffiches = onglet === 'en_attente'
    ? agentsEnAttente
    : onglet === 'verifies'
    ? agentsVerifies
    : agents.filter(a => a.role !== 'admin')

  const demandesEnAttente = demandes.filter(d => d.statut === 'en_attente')

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      {/* MODAL DOSSIER */}
      {demandeSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Dossier de {demandeSelectionnee.agent_email}</h2>
              <button onClick={() => setDemandeSelectionnee(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">CNI recto</p>
                <img src={demandeSelectionnee.photo_cni} alt="CNI recto" className="w-full h-36 object-cover rounded-lg border border-gray-200 cursor-pointer" onClick={() => window.open(demandeSelectionnee.photo_cni, '_blank')} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">CNI verso</p>
                <img src={demandeSelectionnee.photo_cni_verso} alt="CNI verso" className="w-full h-36 object-cover rounded-lg border border-gray-200 cursor-pointer" onClick={() => window.open(demandeSelectionnee.photo_cni_verso, '_blank')} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">Selfie avec CNI</p>
                <img src={demandeSelectionnee.photo_selfie} alt="Selfie" className="w-full h-36 object-cover rounded-lg border border-gray-200 cursor-pointer" onClick={() => window.open(demandeSelectionnee.photo_selfie, '_blank')} />
              </div>
              {demandeSelectionnee.photo_document && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Document professionnel</p>
                  <img src={demandeSelectionnee.photo_document} alt="Document" className="w-full h-36 object-cover rounded-lg border border-gray-200 cursor-pointer" onClick={() => window.open(demandeSelectionnee.photo_document!, '_blank')} />
                </div>
              )}
            </div>

            {demandeSelectionnee.description && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 font-medium mb-1">Informations complémentaires</p>
                <p className="text-sm text-gray-700">{demandeSelectionnee.description}</p>
              </div>
            )}

            {demandeSelectionnee.statut === 'en_attente' && (
              <div className="flex gap-3">
                <button
                  onClick={() => validerDossier(demandeSelectionnee)}
                  className="flex-1 bg-green-600 text-white py-3 rounded-md text-sm font-semibold hover:bg-green-700 transition"
                >
                  Approuver et vérifier l'agent
                </button>
                <button
                  onClick={() => rejeterDossier(demandeSelectionnee)}
                  className="flex-1 border border-red-300 text-red-500 py-3 rounded-md text-sm font-medium hover:bg-red-50 transition"
                >
                  Rejeter le dossier
                </button>
              </div>
            )}

            {demandeSelectionnee.statut !== 'en_attente' && (
              <div className={`text-center py-3 rounded-md text-sm font-medium ${
                demandeSelectionnee.statut === 'approuve'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {demandeSelectionnee.statut === 'approuve' ? 'Dossier approuvé' : 'Dossier rejeté'}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* STATISTIQUES */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-orange-500">{agentsEnAttente.length}</p>
            <p className="text-xs text-gray-500 mt-1">En attente</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-green-600">{agentsVerifies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Agents vérifiés</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-blue-800">{agents.filter(a => a.role !== 'admin').length}</p>
            <p className="text-xs text-gray-500 mt-1">Total agents</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-center">
            <p className="text-2xl font-bold text-purple-600">{demandesEnAttente.length}</p>
            <p className="text-xs text-gray-500 mt-1">Dossiers en attente</p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setOnglet('en_attente')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'en_attente' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            En attente
            {agentsEnAttente.length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{agentsEnAttente.length}</span>
            )}
          </button>
          <button
            onClick={() => setOnglet('verifies')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'verifies' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Vérifiés
          </button>
          <button
            onClick={() => setOnglet('tous')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'tous' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Tous les agents
          </button>
          <button
            onClick={() => setOnglet('dossiers')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'dossiers' ? 'border-blue-800 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Dossiers de vérification
            {demandesEnAttente.length > 0 && (
              <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">{demandesEnAttente.length}</span>
            )}
          </button>
        </div>

        {/* LISTE AGENTS */}
        {onglet !== 'dossiers' && (
          <div>
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
                        agent.verifie ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
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
        )}

        {/* DOSSIERS DE VERIFICATION */}
        {onglet === 'dossiers' && (
          <div>
            {demandes.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">Aucun dossier de vérification reçu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {demandes.map((demande) => (
                  <div key={demande.id} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                        <img src={demande.photo_selfie} alt="Selfie" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{demande.agent_email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Soumis le {new Date(demande.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        demande.statut === 'en_attente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : demande.statut === 'approuve'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {demande.statut === 'en_attente' ? 'En attente' : demande.statut === 'approuve' ? 'Approuvé' : 'Rejeté'}
                      </span>
                      <button
                        onClick={() => setDemandeSelectionnee(demande)}
                        className="text-xs bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition font-medium"
                      >
                        Voir le dossier
                      </button>
                    </div>
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