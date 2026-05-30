'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PagePublier() {
  const { user } = useAuth()
  const router = useRouter()

  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [type_bien, setTypeBien] = useState('')
  const [ville, setVille] = useState('')
  const [quartier, setQuartier] = useState('')
  const [prix, setPrix] = useState('')
  const [superficie, setSuperficie] = useState('')
  const [nombre_pieces, setNombrePieces] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [fichiers, setFichiers] = useState<FileList | null>(null)
  const [uploadEnCours, setUploadEnCours] = useState(false)
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')
  const [erreurMessage, setErreurMessage] = useState('')

  async function gererPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setFichiers(files)
    setUploadEnCours(true)
    setErreurMessage('')

    const urlsPhotos: string[] = []

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
        setErreurMessage('Une photo n\'a pas pu être uploadée. Réessayez.')
      }
    }

    setPhotos(urlsPhotos)
    setUploadEnCours(false)
  }

  async function publierAnnonce() {
    if (!titre || !description || !type_bien || !ville || !quartier || !prix) {
      setErreurMessage('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (!user) {
      router.push('/auth')
      return
    }

    setEnvoi('chargement')
    setErreurMessage('')

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('email', user.email)
      .single()

    if (agentError || !agent) {
      setErreurMessage('Votre compte agent est introuvable. Vérifiez que vous êtes bien connecté.')
      setEnvoi('idle')
      return
    }

    const { error } = await supabase
      .from('annonces')
      .insert({
        titre,
        description,
        type_bien,
        ville,
        quartier,
        prix: parseInt(prix),
        superficie: superficie ? parseInt(superficie) : null,
        nombre_pieces: nombre_pieces ? parseInt(nombre_pieces) : null,
        statut: 'disponible',
        agent_id: agent.id,
        photos
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Annonce publiée</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre annonce est maintenant visible par tous les locataires sur LogiCam.
          </p>
          <Link href="/" className="block w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition">
            Voir les annonces
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-800 tracking-tight">
          LogiCam
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
          Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-14">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Publier une annonce</h1>
        <p className="text-gray-500 text-sm mb-8">
          Remplissez ce formulaire pour mettre votre logement en ligne.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

          {/* TITRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'annonce <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex : Appartement 3 pièces à Bastos"
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
              placeholder="Ex : Bastos, Akwa, Bonamoussadi..."
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
                placeholder="75000"
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
                placeholder="80"
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
                placeholder="3"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le logement : état, équipements, environnement, conditions..."
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* PHOTOS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos du logement
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md px-4 py-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={gererPhotos}
                className="hidden"
                id="input-photos"
              />
              <label htmlFor="input-photos" className="cursor-pointer">
                {uploadEnCours ? (
                  <p className="text-sm text-blue-600">Upload en cours...</p>
                ) : photos.length > 0 ? (
                  <p className="text-sm text-green-600 font-medium">
                    {photos.length} photo{photos.length > 1 ? 's' : ''} ajoutée{photos.length > 1 ? 's' : ''}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-500">Cliquez pour sélectionner des photos</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG — plusieurs photos acceptées</p>
                  </>
                )}
              </label>
            </div>

            {/* APERCU PHOTOS */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
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
          </div>

          {erreurMessage && (
            <p className="text-red-500 text-sm">{erreurMessage}</p>
          )}

          {envoi === 'erreur' && (
            <p className="text-red-500 text-sm">Une erreur s'est produite. Veuillez réessayer.</p>
          )}

          <button
            onClick={publierAnnonce}
            disabled={envoi === 'chargement' || uploadEnCours}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {envoi === 'chargement' ? 'Publication en cours...' : 'Publier l\'annonce'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            En publiant, vous confirmez que les informations fournies sont exactes et vérifiables.
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