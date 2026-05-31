'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../../components/NavBar'

export default function PageReset() {
  const router = useRouter()
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [etape, setEtape] = useState<'reset' | 'succes' | 'erreur'>('reset')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)
  const [sessionPrete, setSessionPrete] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionPrete(true)
      }
    })
  }, [])

  async function changerMotDePasse() {
    if (!motDePasse || !confirmation) {
      setErreur('Veuillez remplir tous les champs.')
      return
    }

    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }

    setChargement(true)
    setErreur('')

    const { error } = await supabase.auth.updateUser({
      password: motDePasse
    })

    if (error) {
      setErreur('Une erreur s\'est produite. Le lien a peut-être expiré.')
      setEtape('erreur')
    } else {
      setEtape('succes')
    }

    setChargement(false)
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Mot de passe modifié</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre mot de passe a été mis à jour avec succès.
          </p>
          <Link
            href="/auth"
            className="block w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition"
          >
            Se connecter
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-sm mb-8">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Répétez le mot de passe"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {erreur && (
  <p className="text-red-500 text-sm mb-4">{erreur}</p>
)}

{mode === 'connexion' && (
  <button
    onClick={envoyerEmailReset}
    className="text-xs text-blue-800 hover:underline font-medium"
  >
    Mot de passe oublié ?
  </button>
)}

          {etape === 'erreur' && (
            <Link
              href="/auth"
              className="block text-center text-sm text-blue-800 font-medium hover:underline"
            >
              Retourner à la page de connexion
            </Link>
          )}

          <button
            onClick={changerMotDePasse}
            disabled={chargement}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {chargement ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
          </button>

        </div>
      </div>

      <footer className="bg-blue-900 py-8 px-6 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold text-lg">LogiCam</span>
          <p className="text-blue-300 text-sm">La plateforme immobilière de confiance au Cameroun</p>
          <p className="text-blue-400 text-xs">© 2026 LogiCam</p>
        </div>
      </footer>

    </main>
  )
}