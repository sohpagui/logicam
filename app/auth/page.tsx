'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../components/NavBar'

export default function PageAuth() {
  const router = useRouter()
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion')
  const [role, setRole] = useState<'agent' | 'locataire'>('locataire')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function handleSoumission() {
    if (!email || !motDePasse) {
      setErreur('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (mode === 'inscription' && (!nom || !telephone || !ville)) {
      setErreur('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setChargement(true)
    setErreur('')

    if (mode === 'inscription') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: motDePasse,
        options: {
          data: { nom, role }
        }
      })

      if (error) {
        setErreur(error.message === 'User already registered'
          ? 'Un compte existe déjà avec cet email.'
          : 'Une erreur s\'est produite. Veuillez réessayer.')
        setChargement(false)
        return
      }

      if (data.user) {
        const table = role === 'agent' ? 'agents' : 'locataires'
        await supabase.from(table).insert({
          nom,
          email,
          telephone,
          ville,
          ...(role === 'agent' ? { verifie: false, note: 0 } : {})
        })

        router.push(role === 'agent' ? '/dashboard' : '/')
      }

    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: motDePasse
      })

      if (error) {
        setErreur('Email ou mot de passe incorrect.')
        setChargement(false)
        return
      }

      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('email', email)
        .single()

      router.push(agent ? '/dashboard' : '/')
    }

    setChargement(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-md mx-auto px-6 py-16">

        {/* ONGLETS CONNEXION / INSCRIPTION */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => { setMode('connexion'); setErreur('') }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${
              mode === 'connexion'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode('inscription'); setErreur('') }}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${
              mode === 'inscription'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Inscription
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

          {/* CHOIX DU ROLE (inscription seulement) */}
          {mode === 'inscription' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Je suis
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRole('locataire')}
                  className={`py-3 rounded-md text-sm font-medium border transition ${
                    role === 'locataire'
                      ? 'bg-blue-800 text-white border-blue-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-800'
                  }`}
                >
                  Locataire
                </button>
                <button
                  onClick={() => setRole('agent')}
                  className={`py-3 rounded-md text-sm font-medium border transition ${
                    role === 'agent'
                      ? 'bg-blue-800 text-white border-blue-800'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-800'
                  }`}
                >
                  Agent immobilier
                </button>
              </div>
            </div>
          )}

          {/* NOM (inscription seulement) */}
          {mode === 'inscription' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Jean-Pierre Mbarga"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex : pascal@gmail.com"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* MOT DE PASSE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* TELEPHONE ET VILLE (inscription seulement) */}
          {mode === 'inscription' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex : 699123456"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville <span className="text-red-500">*</span>
                </label>
                <select
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Choisir</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Douala">Douala</option>
                  <option value="Bafoussam">Bafoussam</option>
                  <option value="Garoua">Garoua</option>
                </select>
              </div>
            </div>
          )}

          {erreur && (
            <p className="text-red-500 text-sm">{erreur}</p>
          )}

          <button
            onClick={handleSoumission}
            disabled={chargement}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {chargement
              ? 'Chargement...'
              : mode === 'connexion'
              ? 'Se connecter'
              : 'Créer mon compte'}
          </button>

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