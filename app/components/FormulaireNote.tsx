'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import Link from 'next/link'

type Props = {
  agentId: string
  agentNom: string
}

export default function FormulaireNote({ agentId, agentNom }: Props) {
  const { user } = useAuth()
  const [noteSelectionnee, setNoteSelectionnee] = useState(0)
  const [noteHover, setNoteHover] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [envoi, setEnvoi] = useState<'idle' | 'chargement' | 'succes' | 'erreur'>('idle')
  const [erreur, setErreur] = useState('')

  async function envoyerNote() {
    if (!noteSelectionnee) {
      setErreur('Veuillez sélectionner une note.')
      return
    }

    setEnvoi('chargement')
    setErreur('')

    const { data: dejaNote } = await supabase
      .from('notes')
      .select('id')
      .eq('agent_id', agentId)
      .eq('locataire_email', user?.email)
      .single()

    if (dejaNote) {
      setErreur('Vous avez déjà noté cet agent.')
      setEnvoi('idle')
      return
    }

    const { error } = await supabase
      .from('notes')
      .insert({
        agent_id: agentId,
        locataire_email: user?.email,
        note: noteSelectionnee,
        commentaire: commentaire || null
      })

    if (error) {
      console.error(error)
      setEnvoi('erreur')
    } else {
      setEnvoi('succes')

      const { data: toutesLesNotes } = await supabase
        .from('notes')
        .select('note')
        .eq('agent_id', agentId)

      if (toutesLesNotes && toutesLesNotes.length > 0) {
        const moyenne = toutesLesNotes.reduce((acc, n) => acc + n.note, 0) / toutesLesNotes.length
        await supabase
          .from('agents')
          .update({ note: parseFloat(moyenne.toFixed(1)) })
          .eq('id', agentId)
      }
    }
  }

  if (!user) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Noter cet agent</h3>
        <p className="text-sm text-gray-500 mb-4">
          Connectez-vous pour laisser un avis sur {agentNom}.
        </p>
        <Link
          href="/auth"
          className="block w-full bg-blue-800 text-white text-center py-2.5 rounded-md text-sm font-medium hover:bg-blue-900 transition"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  if (envoi === 'succes') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 text-sm">Avis envoyé</p>
          <p className="text-xs text-gray-500 mt-1">Merci pour votre retour.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Noter cet agent</h3>

      {/* ETOILES */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((etoile) => (
          <button
            key={etoile}
            onClick={() => setNoteSelectionnee(etoile)}
            onMouseEnter={() => setNoteHover(etoile)}
            onMouseLeave={() => setNoteHover(0)}
            className="text-2xl transition"
          >
            <span className={
              etoile <= (noteHover || noteSelectionnee)
                ? 'text-orange-400'
                : 'text-gray-300'
            }>
              ★
            </span>
          </button>
        ))}
        {noteSelectionnee > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            {['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'][noteSelectionnee]}
          </span>
        )}
      </div>

      {/* COMMENTAIRE */}
      <div className="mb-4">
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Laissez un commentaire (optionnel)..."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
        />
      </div>

      {erreur && (
        <p className="text-red-500 text-xs mb-3">{erreur}</p>
      )}

      {envoi === 'erreur' && (
        <p className="text-red-500 text-xs mb-3">Une erreur s'est produite. Veuillez réessayer.</p>
      )}

      <button
        onClick={envoyerNote}
        disabled={envoi === 'chargement'}
        className="w-full bg-blue-800 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-50"
      >
        {envoi === 'chargement' ? 'Envoi...' : 'Envoyer mon avis'}
      </button>
    </div>
  )
}