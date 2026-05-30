'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function PageMonEspace() {
  const { user, chargement } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!chargement && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      redirigerUtilisateur()
    }
  }, [user, chargement])

  async function redirigerUtilisateur() {
    if (!user) return

    const { data: agent } = await supabase
      .from('agents')
      .select('role')
      .eq('email', user.email)
      .single()

    if (agent) {
      if (agent.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      return
    }

    const { data: locataire } = await supabase
      .from('locataires')
      .select('id')
      .eq('email', user.email)
      .single()

    if (locataire) {
      router.push('/locataire')
      return
    }

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement...</p>
    </main>
  )
}