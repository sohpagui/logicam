'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NavBar from '../components/NavBar'

export default function PageVerification() {
  const { user, chargement: authChargement } = useAuth()
  const router = useRouter()

  const [photoCni, setPhotoCni] = useState('')
  const [photoCniVerso, setPhotoCniVerso] = useState('')
  const [photoSelfie, setPhotoSelfie] = useState('')
  const [photoDocument, setPhotoDocument] = useState('')
  const [description, setDescription] = useState('')
  const [uploads, setUploads] = useState({
    cni: false,
    cni_verso: false,
    selfie: false,
    document: false
  })
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')
  const [erreur, setErreur] = useState('')
  const [dejaEnvoye, setDejaEnvoye] = useState(false)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!authChargement && !user) {
      router.push('/auth')
      return
    }
    if (user) {
      verifierStatut()
    }
  }, [user, authChargement])

  async function verifierStatut() {
    const { data } = await supabase
      .from('demandes_verification')
      .select('id, statut')
      .eq('agent_email', user?.email)
      .single()

    if (data) {
      setDejaEnvoye(true)
    }
    setChargement(false)
  }

  async function uploaderFichier(
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cni' | 'cni_verso' | 'selfie' | 'document'
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploads(prev => ({ ...prev, [type]: true }))

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.url) {
      if (type === 'cni') setPhotoCni(data.url)
      if (type === 'cni_verso') setPhotoCniVerso(data.url)
      if (type === 'selfie') setPhotoSelfie(data.url)
      if (type === 'document') setPhotoDocument(data.url)
    }

    setUploads(prev => ({ ...prev, [type]: false }))
  }

  async function soumettreDemande() {
    if (!photoCni || !photoCniVerso || !photoSelfie) {
      setErreur('Veuillez fournir la CNI recto, verso et le selfie avec CNI.')
      return
    }

    setEnvoi('chargement')
    setErreur('')

    const { error } = await supabase
      .from('demandes_verification')
      .insert({
        agent_email: user?.email,
        photo_cni: photoCni,
        photo_cni_verso: photoCniVerso,
        photo_selfie: photoSelfie,
        photo_document: photoDocument || null,
        description: description || null,
        statut: 'en_attente'
      })

    if (error) {
      console.error(error)
      setEnvoi('erreur')
    } else {
      setEnvoi('succes')
      setDejaEnvoye(true)
    }
  }

  if (authChargement || chargement) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </main>
    )
  }

  if (dejaEnvoye && envoi !== 'succes') {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Demande en cours d'examen</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre dossier a été soumis et est en cours de vérification par notre équipe. Vous serez notifié par email une fois la vérification terminée.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-800 text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition"
          >
            Retour au tableau de bord
          </Link>
        </div>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dossier soumis</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre dossier de vérification a été envoyé. Notre équipe va l'examiner et vous contacter dans les plus brefs délais.
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

  return (
    <main className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vérification d'identité</h1>
          <p className="text-gray-500 text-sm">
            Pour obtenir le badge "Agent vérifié", soumettez les documents ci-dessous. Votre dossier sera examiné par notre équipe sous 48h.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800 font-medium mb-1">Documents requis</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>— CNI recto (obligatoire)</li>
            <li>— CNI verso (obligatoire)</li>
            <li>— Selfie en tenant votre CNI devant votre visage (obligatoire)</li>
            <li>— Carte professionnelle ou attestation d'agent immobilier (recommandé)</li>
          </ul>
        </div>

        <div className="space-y-6">

          {/* CNI RECTO */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-800 text-sm">CNI recto <span className="text-red-500">*</span></p>
                <p className="text-xs text-gray-500 mt-0.5">Photo claire de votre carte d'identité côté face</p>
              </div>
              {photoCni && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Ajouté</span>
              )}
            </div>
            {photoCni && (
              <img src={photoCni} alt="CNI recto" className="w-full h-32 object-cover rounded-md border border-gray-200 mb-3" />
            )}
            <input type="file" accept="image/*" onChange={(e) => uploaderFichier(e, 'cni')} className="hidden" id="input-cni" />
            <label htmlFor="input-cni" className="cursor-pointer text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:border-blue-800 hover:text-blue-800 transition inline-block">
              {uploads.cni ? 'Upload en cours...' : photoCni ? 'Changer la photo' : 'Ajouter la photo'}
            </label>
          </div>

          {/* CNI VERSO */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-800 text-sm">CNI verso <span className="text-red-500">*</span></p>
                <p className="text-xs text-gray-500 mt-0.5">Photo claire de votre carte d'identité côté dos</p>
              </div>
              {photoCniVerso && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Ajouté</span>
              )}
            </div>
            {photoCniVerso && (
              <img src={photoCniVerso} alt="CNI verso" className="w-full h-32 object-cover rounded-md border border-gray-200 mb-3" />
            )}
            <input type="file" accept="image/*" onChange={(e) => uploaderFichier(e, 'cni_verso')} className="hidden" id="input-cni-verso" />
            <label htmlFor="input-cni-verso" className="cursor-pointer text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:border-blue-800 hover:text-blue-800 transition inline-block">
              {uploads.cni_verso ? 'Upload en cours...' : photoCniVerso ? 'Changer la photo' : 'Ajouter la photo'}
            </label>
          </div>

          {/* SELFIE AVEC CNI */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-800 text-sm">Selfie avec CNI <span className="text-red-500">*</span></p>
                <p className="text-xs text-gray-500 mt-0.5">Photo de vous tenant votre CNI devant votre visage</p>
              </div>
              {photoSelfie && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Ajouté</span>
              )}
            </div>
            {photoSelfie && (
              <img src={photoSelfie} alt="Selfie CNI" className="w-full h-32 object-cover rounded-md border border-gray-200 mb-3" />
            )}
            <input type="file" accept="image/*" onChange={(e) => uploaderFichier(e, 'selfie')} className="hidden" id="input-selfie" />
            <label htmlFor="input-selfie" className="cursor-pointer text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:border-blue-800 hover:text-blue-800 transition inline-block">
              {uploads.selfie ? 'Upload en cours...' : photoSelfie ? 'Changer la photo' : 'Ajouter la photo'}
            </label>
          </div>

          {/* DOCUMENT PROFESSIONNEL */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-800 text-sm">Document professionnel</p>
                <p className="text-xs text-gray-500 mt-0.5">Carte professionnelle, attestation d'employeur ou mandat immobilier</p>
              </div>
              {photoDocument && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Ajouté</span>
              )}
            </div>
            {photoDocument && (
              <img src={photoDocument} alt="Document pro" className="w-full h-32 object-cover rounded-md border border-gray-200 mb-3" />
            )}
            <input type="file" accept="image/*" onChange={(e) => uploaderFichier(e, 'document')} className="hidden" id="input-document" />
            <label htmlFor="input-document" className="cursor-pointer text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-md hover:border-blue-800 hover:text-blue-800 transition inline-block">
              {uploads.document ? 'Upload en cours...' : photoDocument ? 'Changer le document' : 'Ajouter le document'}
            </label>
          </div>

          {/* COMMENTAIRE */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="font-medium text-gray-800 text-sm mb-2">Informations complémentaires</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre activité d'agent immobilier, votre expérience, l'agence pour laquelle vous travaillez..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {erreur && (
            <p className="text-red-500 text-sm">{erreur}</p>
          )}

          {envoi === 'erreur' && (
            <p className="text-red-500 text-sm">Une erreur s'est produite. Veuillez réessayer.</p>
          )}

          <button
            onClick={soumettreDemande}
            disabled={envoi === 'chargement'}
            className="w-full bg-blue-800 text-white py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
          >
            {envoi === 'chargement' ? 'Envoi en cours...' : 'Soumettre mon dossier'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Vos documents sont traités de manière confidentielle et ne seront utilisés qu'à des fins de vérification.
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