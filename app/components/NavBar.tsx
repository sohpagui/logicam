'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const { user, chargement, seDeconnecter } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
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

  const actif = (href: string) => pathname === href

  return (
    <>
      {/* NAVBAR HAUT — visible sur desktop, cachée sur mobile */}
      <nav className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-800 tracking-tight">
          LogiCam
        </Link>

        <div className="flex items-center gap-4">
          {chargement ? null : user ? (
            <>
              {estAdmin && (
                <Link href="/admin" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Administration
                </Link>
              )}
              <Link href="/mon-espace" className="text-sm text-gray-600 hover:text-blue-800 font-medium relative">
                Mon espace
                {messagesNonLus > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {messagesNonLus > 9 ? '9+' : messagesNonLus}
                  </span>
                )}
              </Link>
              <Link href="/parametres" className="flex items-center gap-2">
                {photoProfil ? (
                  <img src={photoProfil} alt="Photo de profil" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm border border-gray-200">
                    {nomUtilisateur.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <button onClick={gererDeconnexion} className="text-sm text-red-500 hover:underline font-medium">
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="text-sm text-gray-600 hover:text-blue-800 font-medium">
                Connexion
              </Link>
              <Link href="/publier" className="text-sm bg-blue-800 text-white px-5 py-2 rounded-md hover:bg-blue-900 font-medium">
                Publier une annonce
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* NAVBAR HAUT MOBILE — logo + profil + déconnexion */}
<nav className="flex md:hidden bg-white border-b border-gray-200 px-5 py-4 justify-between items-center">
  <Link href="/" className="text-xl font-bold text-blue-800 tracking-tight">
    LogiCam
  </Link>
  <div className="flex items-center gap-3">
    {user && (
      <button onClick={gererDeconnexion} className="text-xs text-red-500 font-medium border border-red-200 px-3 py-1.5 rounded-md">
        Déconnexion
      </button>
    )}
    {user && (
      <Link href="/parametres">
        {photoProfil ? (
          <img src={photoProfil} alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-blue-100" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
            {nomUtilisateur.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
    )}
  </div>
</nav>

      {/* BARRE DE NAVIGATION EN BAS — mobile uniquement */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe">
        <div className="grid grid-cols-4 h-16">

          {/* ACCUEIL */}
          <Link href="/" className={`flex flex-col items-center justify-center gap-1 transition ${actif('/') ? 'text-blue-800' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill={actif('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={actif('/') ? 0 : 1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Accueil</span>
          </Link>

          {/* RECHERCHE */}
          <Link href="/annonces" className={`flex flex-col items-center justify-center gap-1 transition ${actif('/annonces') || actif('/recherche') ? 'text-blue-800' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium">Rechercher</span>
          </Link>

          {/* PUBLIER */}
          <Link href="/publier" className={`flex flex-col items-center justify-center gap-1 transition ${actif('/publier') ? 'text-blue-800' : 'text-gray-400'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md -mt-4 ${actif('/publier') ? 'bg-blue-900' : 'bg-blue-800'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium mt-1">Publier</span>
          </Link>

          {/* MON COMPTE */}
          <Link href="/mon-espace" className={`flex flex-col items-center justify-center gap-1 transition relative ${actif('/mon-espace') || actif('/dashboard') || actif('/locataire') ? 'text-blue-800' : 'text-gray-400'}`}>
            {photoProfil ? (
              <img src={photoProfil} alt="Profil" className="w-7 h-7 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <svg className="w-6 h-6" fill={actif('/mon-espace') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            {messagesNonLus > 0 && (
              <span className="absolute top-1 right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {messagesNonLus > 9 ? '9+' : messagesNonLus}
              </span>
            )}
            <span className="text-xs font-medium">Mon compte</span>
          </Link>

        </div>
      </div>

      {/* ESPACE EN BAS pour que le contenu ne soit pas caché par la barre mobile */}
      <div className="h-16 md:hidden" />
    </>
  )
}