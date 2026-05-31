'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../../components/NavBar'

type Annonce = {
  id: string
  titre: string
  ville: string
  quartier: string
  prix: number
  booste: boolean
  boost_expire_le: string | null
}

export default function PageBoost({ params }: { params: Promise<{ id: string }> }) {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [telephone, setTelephone] = useState('')
  const [duree, setDuree] = useState<7 | 30>(7)
  const [etape, setEtape] = useState<'choix' | 'paiement' | 'attente' | 'succes' | 'erreur'>('choix')
  const [erreurMessage, setErreurMessage] = useState('')
  const [chargement, setChargement] = useState(true)
  const [annonceId, setAnnonceId] = useState('')

  useEffect(() => {
    if (!authChargement && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      chargerAnnonce()
    }
  }, [user, authChargement])

  async function chargerAnnonce() {
    const { id } = await (params as Promise<{ id: string }>)
    setAnnonceId(id)

    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      router.push('/dashboard')
      return
    }

    setAnnonce(data)
    setChargement(false)
  }

  async function lancerPaiement() {
    if (!telephone) {
      setErreurMessage('Veuillez entrer votre numéro de téléphone.')
      return
    }

    if (telephone.length < 9) {
      setErreurMessage('Numéro de téléphone invalide.')
      return
    }

    setEtape('paiement')
    setErreurMessage('')

    const numeroFormate = telephone.startsWith('237')
      ? telephone
      : `237${telephone}`

    const response = await fetch('/api/campay/paiement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        annonce_id: annonceId,
        agent_email: user?.email,
        telephone: numeroFormate,
        duree_jours: duree
      })
    })

    const data = await response.json()

    if (!response.ok || !data.succes) {
      setErreurMessage(data.erreur || 'Une erreur s\'est produite.')
      setEtape('choix')
      return
    }

    setEtape('attente')

    let tentatives = 0
    const intervalle = setInterval(async () => {
      tentatives++

      const { data: boost } = await supabase
        .from('boosts')
        .select('statut')
        .eq('annonce_id', annonceId)
        .eq('agent_email', user?.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (boost?.statut === 'paye') {
        clearInterval(intervalle)
        setEtape('succes')
      } else if (boost?.statut === 'echoue' || tentatives >= 24) {
        clearInterval(intervalle)
        setEtape('erreur')
        setErreurMessage('Paiement échoué ou délai dépassé. Veuillez réessayer.')
      }
    }, 5000)
  }

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
  }

  if (etape === 'succes') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-lg p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Boost activé</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre annonce est maintenant mise en avant pour {duree} jours.
          </p>
          <Link
            href="/dashboard"
            className="block w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </main>
    )
  }

  if (etape === 'attente') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-lg p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-7 h-7 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">En attente de paiement</h2>
          <p className="text-gray-500 text-sm mb-2">
            Une demande a été envoyée au numéro <span className="font-medium">{telephone}</span>.
          </p>
          <p className="text-gray-400 text-xs">
            Confirmez le paiement sur votre téléphone. Cette page se met à jour automatiquement.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-lg mx-auto px-6 py-14">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Booster une annonce</h1>
        <p className="text-gray-500 text-sm mb-8">
          Votre annonce apparaîtra en tête de liste avec un badge visible.
        </p>

        {annonce && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm flex-shrink-0">
              {annonce.titre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{annonce.titre}</p>
              <p className="text-xs text-gray-500">{annonce.quartier}, {annonce.ville}</p>
            </div>
            {annonce.booste && (
              <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                Déjà boosté
              </span>
            )}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">

          {/* CHOIX DUREE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Durée du boost
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDuree(7)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  duree === 7
                    ? 'border-blue-800 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <p className="font-bold text-gray-800 text-sm">7 jours</p>
                <p className="text-blue-800 font-bold text-lg mt-1">500 FCFA</p>
                <p className="text-xs text-gray-500 mt-1">Idéal pour tester</p>
              </button>
              <button
                onClick={() => setDuree(30)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  duree === 30
                    ? 'border-blue-800 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <p className="font-bold text-gray-800 text-sm">30 jours</p>
                <p className="text-blue-800 font-bold text-lg mt-1">1 500 FCFA</p>
                <p className="text-xs text-gray-500 mt-1">Meilleur rapport</p>
              </button>
            </div>
          </div>

          {/* NUMERO TELEPHONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro MTN ou Orange Money
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
              <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
                +237
              </span>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="6XXXXXXXX"
                className="flex-1 px-4 py-3 text-sm text-gray-700 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Test MTN : 677777777 — Test Orange : 699999999
            </p>
          </div>

          {erreurMessage && (
            <p className="text-red-500 text-sm">{erreurMessage}</p>
          )}

          <button
            onClick={lancerPaiement}
            disabled={etape === 'paiement'}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {etape === 'paiement' ? 'Initialisation...' : `Payer ${duree === 7 ? '500' : '1 500'} FCFA`}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Paiement sécurisé via CamPay — MTN Mobile Money et Orange Money acceptés
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