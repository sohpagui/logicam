'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NavBar() {
  const { user, chargement, seDeconnecter } = useAuth()
  const router = useRouter()
  const [estAdmin, setEstAdmin] = useState(false)
  const [messagesNonLus, setMessagesNonLus] = useState(0)
  const [photoProfil, setPhotoProfil] = useState('')
  const [nomUtilisateur, setNomUtilisateur] = useState('')

  useEffect(() => {
    if (user) {
      verifierRole()
    } else {
      setEstAdmin(false)
      setMessagesNonLus(0)
      setPhotoProfil('')
      setNomUtilisateur('')
    }
  }, [user])

  async function verifierRole() {
    const { data: agent } = await supabase
      .from('agents')
      .select('id, role, photo_profil, nom')
      .eq('email', user?.email)
      .single()

    if (agent) {
      setEstAdmin(agent.role === 'admin')
      setPhotoProfil(agent.photo_profil || '')
      setNomUtilisateur(agent.nom || '')

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('agent_id', agent.id)
        .eq('lu', false)

      setMessagesNonLus(count || 0)
      return
    }

    const { data: locataire } = await supabase
      .from('locataires')
      .select('photo_profil, nom')
      .eq('email', user?.email)
      .single()

    if (locataire) {
      setPhotoProfil(locataire.photo_profil || '')
      setNomUtilisateur(locataire.nom || '')
    }
  }

  async function gererDeconnexion() {
    await seDeconnecter()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-800 tracking-tight">
        LogiCam
      </Link>

      <div className="flex items-center gap-4">
        {chargement ? null : user ? (
          <>
            {estAdmin && (
              <Link
                href="/admin"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Administration
              </Link>
            )}
            <Link
              href="/mon-espace"
              className="text-sm text-gray-600 hover:text-blue-800 font-medium relative"
            >
              Mon espace
              {messagesNonLus > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {messagesNonLus > 9 ? '9+' : messagesNonLus}
                </span>
              )}
            </Link>
            <Link href="/parametres" className="flex items-center gap-2">
              {photoProfil ? (
                <img
                  src={photoProfil}
                  alt="Photo de profil"
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm border border-gray-200">
                  {nomUtilisateur.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <button
              onClick={gererDeconnexion}
              className="text-sm text-red-500 hover:underline font-medium"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="text-sm text-gray-600 hover:text-blue-800 font-medium"
            >
              Connexion
            </Link>
            <Link
              href="/publier"
              className="text-sm bg-blue-800 text-white px-5 py-2 rounded-md hover:bg-blue-900 font-medium"
            >
              Publier une annonce
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}