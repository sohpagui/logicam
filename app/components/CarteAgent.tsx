'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  agent: {
    nom: string
    verifie: boolean
    note: number
    photo_profil?: string
  }
  agentId: string
  annonceId: string
}

export default function CarteAgent({ agent, agentId, annonceId }: Props) {
  const [photoAgrandie, setPhotoAgrandie] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
      <h2 className="font-semibold text-gray-800 mb-4">Agent responsable</h2>

      {/* MODAL PHOTO AGRANDIE */}
      {photoAgrandie && agent.photo_profil && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPhotoAgrandie(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={agent.photo_profil}
              alt={agent.nom}
              className="max-w-xs max-h-96 rounded-xl object-cover shadow-2xl"
            />
            <button
              onClick={() => setPhotoAgrandie(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md text-gray-600 hover:text-gray-800 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 ${
            agent.photo_profil ? 'cursor-pointer hover:opacity-90 transition' : ''
          }`}
          onClick={() => agent.photo_profil && setPhotoAgrandie(true)}
          title={agent.photo_profil ? 'Cliquer pour agrandir' : ''}
        >
          {agent.photo_profil ? (
            <img
              src={agent.photo_profil}
              alt={agent.nom}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
              {agent.nom.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <Link
            href={`/agent/${agentId}`}
            className="font-semibold text-blue-800 text-sm hover:underline"
          >
            {agent.nom}
          </Link>
          {agent.verifie && (
            <p className="text-xs text-green-600 font-medium">Agent vérifié</p>
          )}
        </div>
      </div>

      {agent.note > 0 && (
        <p className="text-sm text-gray-500 mb-6">
          Note : <span className="font-semibold text-gray-800">{agent.note}/5</span>
        </p>
      )}

      <Link
        href={`/contact/${annonceId}`}
        className="block w-full bg-blue-800 text-white text-center py-3 rounded-md text-sm font-semibold hover:bg-blue-900 transition mb-3"
      >
        Contacter l'agent
      </Link>

      <p className="text-xs text-gray-400 text-center">
        Vos échanges sont sécurisés et enregistrés
      </p>
    </div>
  )
}