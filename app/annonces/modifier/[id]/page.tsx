'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../../../components/NavBar'

type Annonce = {
  id: string
  titre: string
  description: string
  type_bien: string
  ville: string
  quartier: string
  prix: number
  superficie: number | null
  nombre_pieces: number | null
  statut: string
  photos: string[]
  agent_id: string
}

export default function PageModifierAnnonce({ params }: { params: Promise<{ id: string }> }) {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [type_bien, setTypeBien] = useState('')
  const [ville, setVille] = useState('')
  const [quartier, setQuartier] = useState('')
  const [prix, setPrix] = useState('')
  const [superficie, setSuperficie] = useState('')
  const [nombre_pieces, setNombrePieces] = useState('')
  const [statut, setStatut] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')
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

    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('email', user?.email)
      .single()

    if (!agent || data.agent_id !== agent.id) {
      router.push('/dashboard')
      return
    }

    setAnnonce(data)
    setTitre(data.titre)
    setDescription(data.description)
    setTypeBien(data.type_bien)
    setVille(data.ville)
    setQuartier(data.quartier)
    setPrix(data.prix.toString())
    setSuperficie(data.superficie?.toString() || '')
    setNombrePieces(data.nombre_pieces?.toString() || '')
    setStatut(data.statut)
    setPhotos(data.photos || [])
    setChargement(false)
  }

  async function gererPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadEnCours(true)
    setErreurMessage('')

    const urlsPhotos: string[] = [...photos]

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('file', files[i])

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.url) {
        urlsPhotos.push(data.url)
      } else {
        setErreurMessage('Une photo n\'a pas pu être uploadée.')
      }
    }

    setPhotos(urlsPhotos)
    setUploadEnCours(false)
  }

  async function modifierAnnonce() {
    if (!titre || !description || !type_bien || !ville || !quartier || !prix) {
      setErreurMessage('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setEnvoi('chargement')
    setErreurMessage('')

    const { error } = await supabase
      .from('annonces')
      .update({
        titre,
        description,
        type_bien,
        ville,
        quartier,
        prix: parseInt(prix),
        superficie: superficie ? parseInt(superficie) : null,
        nombre_pieces: nombre_pieces ? parseInt(nombre_pieces) : null,
        statut,
        photos
      })
      .eq('id', annonceId)

    if (error) {
      console.error(error)
      setEnvoi('erreur')
    } else {
      setEnvoi('succes')
    }
  }

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Annonce modifiée</h2>
          <p className="text-gray-500 text-sm mb-6">
            Les modifications ont été enregistrées avec succès.
          </p>
          <div className="space-y-3">
            <Link
              href={`/annonces/${annonceId}`}
              className="block w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition"
            >
              Voir l'annonce
            </Link>
            <Link
              href="/dashboard"
              className="block w-full border border-gray-300 text-gray-600 py-3 rounded-md text-sm font-medium hover:border-blue-800 hover:text-blue-800 transition"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Modifier l'annonce</h1>
            <p className="text-gray-500 text-sm mt-1">
              Mettez à jour les informations de votre logement.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-blue-800 font-medium"
          >
            Retour
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

          {/* TITRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* TYPE ET VILLE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien <span className="text-red-500">*</span>
              </label>
              <select
                value={type_bien}
                onChange={(e) => setTypeBien(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Choisir</option>
                <option value="studio">Studio</option>
                <option value="appartement">Appartement</option>
                <option value="villa">Villa</option>
                <option value="maison">Maison</option>
              </select>
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

          {/* QUARTIER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quartier <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* PRIX, SUPERFICIE, PIECES */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix / mois (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Superficie (m²)
              </label>
              <input
                type="number"
                value={superficie}
                onChange={(e) => setSuperficie(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de pièces
              </label>
              <input
                type="number"
                value={nombre_pieces}
                onChange={(e) => setNombrePieces(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* STATUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de l'annonce
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="disponible">Disponible</option>
              <option value="bientot_disponible">Bientôt disponible</option>
              <option value="loue">Loué</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* PHOTOS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos du logement
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {photos.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-md px-4 py-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={gererPhotos}
                className="hidden"
                id="input-photos-modifier"
              />
              <label htmlFor="input-photos-modifier" className="cursor-pointer">
                {uploadEnCours ? (
                  <p className="text-sm text-blue-600">Upload en cours...</p>
                ) : (
                  <p className="text-sm text-gray-500">Cliquez pour ajouter des photos</p>
                )}
              </label>
            </div>
          </div>

          {erreurMessage && (
            <p className="text-red-500 text-sm">{erreurMessage}</p>
          )}

          {envoi === 'erreur' && (
            <p className="text-red-500 text-sm">Une erreur s'est produite. Veuillez réessayer.</p>
          )}

          <button
            onClick={modifierAnnonce}
            disabled={envoi === 'chargement' || uploadEnCours}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {envoi === 'chargement' ? 'Enregistrement...' : 'Enregistrer les modifications'}
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