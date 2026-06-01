'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import NavBar from '../components/NavBar'

type Profil = {
  id: string
  nom: string
  email: string
  telephone: string
  ville: string
  photo_profil?: string
  role?: string
}

export default function PageParametres() {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [profil, setProfil] = useState<Profil | null>(null)
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [photoProfil, setPhotoProfil] = useState('')
  const [photoAgrandie, setPhotoAgrandie] = useState(false)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')
  const [erreur, setErreur] = useState('')
  const [table, setTable] = useState<'agents' | 'locataires'>('locataires')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('')
  const [envoiMdp, setEnvoiMdp] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')
  const [erreurMdp, setErreurMdp] = useState('')
  const [onglet, setOnglet] = useState<'profil' | 'securite'>('profil')

  useEffect(() => {
    if (!authChargement && !user) {
      router.push('/auth')
      return
    }
    if (user) {
      chargerProfil()
    }
  }, [user, authChargement])

  async function chargerProfil() {
    if (!user) return

    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('email', user.email)
      .single()

    if (agent) {
      setProfil(agent)
      setNom(agent.nom)
      setTelephone(agent.telephone)
      setVille(agent.ville)
      setPhotoProfil(agent.photo_profil || '')
      setTable('agents')
      setChargement(false)
      return
    }

    const { data: locataire } = await supabase
      .from('locataires')
      .select('*')
      .eq('email', user.email)
      .single()

    if (locataire) {
      setProfil(locataire)
      setNom(locataire.nom)
      setTelephone(locataire.telephone)
      setVille(locataire.ville)
      setPhotoProfil(locataire.photo_profil || '')
      setTable('locataires')
    }

    setChargement(false)
  }

  async function uploaderPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadEnCours(true)

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.url) {
      setPhotoProfil(data.url)
    }

    setUploadEnCours(false)
  }

  async function sauvegarderProfil() {
    if (!nom || !telephone || !ville) {
      setErreur('Veuillez remplir tous les champs.')
      return
    }

    setEnvoi('chargement')
    setErreur('')

    const { error } = await supabase
      .from(table)
      .update({ nom, telephone, ville, photo_profil: photoProfil })
      .eq('email', user?.email)

    if (error) {
      console.error(error)
      setEnvoi('erreur')
    } else {
      setEnvoi('succes')
      setTimeout(() => setEnvoi('idle'), 3000)
    }
  }

  async function changerMotDePasse() {
    if (!nouveauMotDePasse || !confirmationMotDePasse) {
      setErreurMdp('Veuillez remplir tous les champs.')
      return
    }

    if (nouveauMotDePasse.length < 6) {
      setErreurMdp('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreurMdp('Les deux mots de passe ne correspondent pas.')
      return
    }

    setEnvoiMdp('chargement')
    setErreurMdp('')

    const { error } = await supabase.auth.updateUser({
      password: nouveauMotDePasse
    })

    if (error) {
      setErreurMdp('Une erreur s\'est produite. Veuillez réessayer.')
      setEnvoiMdp('erreur')
    } else {
      setEnvoiMdp('succes')
      setNouveauMotDePasse('')
      setConfirmationMotDePasse('')
      setTimeout(() => setEnvoiMdp('idle'), 3000)
    }
  }

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

      {/* MODAL PHOTO AGRANDIE */}
      {photoAgrandie && photoProfil && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPhotoAgrandie(false)}
        >
          <img
            src={photoProfil}
            alt="Photo de profil"
            className="max-w-sm max-h-96 rounded-xl object-cover shadow-2xl"
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-800 mb-8">Paramètres du compte</h1>

        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setOnglet('profil')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'profil'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Mon profil
          </button>
          <button
            onClick={() => setOnglet('securite')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              onglet === 'securite'
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Sécurité
          </button>
        </div>

        {onglet === 'profil' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">

            <div className="flex items-center gap-6">
              <div className="relative">
                {photoProfil ? (
                  <img
                    src={photoProfil}
                    alt="Photo de profil"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-90 transition"
                    onClick={() => setPhotoAgrandie(true)}
                    title="Cliquer pour agrandir"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-2xl border-2 border-gray-200">
                    {nom.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Photo de profil</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploaderPhoto}
                  className="hidden"
                  id="input-photo-profil"
                />
                <label
                  htmlFor="input-photo-profil"
                  className="cursor-pointer text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:border-blue-800 hover:text-blue-800 transition"
                >
                  {uploadEnCours ? 'Upload en cours...' : 'Changer la photo'}
                </label>
                {photoProfil && (
                  <button
                    onClick={() => setPhotoProfil('')}
                    className="text-xs text-red-500 hover:underline mt-2 block"
                  >
                    Supprimer la photo
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
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

            {erreur && (
              <p className="text-red-500 text-sm">{erreur}</p>
            )}

            {envoi === 'succes' && (
              <p className="text-green-600 text-sm font-medium">Profil mis à jour avec succès.</p>
            )}

            {envoi === 'erreur' && (
              <p className="text-red-500 text-sm">Une erreur s'est produite. Veuillez réessayer.</p>
            )}

            <button
              onClick={sauvegarderProfil}
              disabled={envoi === 'chargement' || uploadEnCours}
              className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
            >
              {envoi === 'chargement' ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

          </div>
        )}

        {onglet === 'securite' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

            <h2 className="font-semibold text-gray-800">Changer le mot de passe</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmationMotDePasse}
                onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {erreurMdp && (
              <p className="text-red-500 text-sm">{erreurMdp}</p>
            )}

            {envoiMdp === 'succes' && (
              <p className="text-green-600 text-sm font-medium">Mot de passe modifié avec succès.</p>
            )}

            <button
              onClick={changerMotDePasse}
              disabled={envoiMdp === 'chargement'}
              className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
            >
              {envoiMdp === 'chargement' ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>

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