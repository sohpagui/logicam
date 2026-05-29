'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function NavBar() {
  const { user, chargement, seDeconnecter } = useAuth()
  const router = useRouter()

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
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-blue-800 font-medium"
            >
              Mon espace
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