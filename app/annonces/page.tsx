'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NavBar from '../components/NavBar'

type Annonce = {
  id: string
  titre: string
  quartier: string
  ville: string
  prix: number
  superficie: number | null
  nombre_pieces: number | null
  type_bien: string
  statut: string
  photos: string[]
  agents: { nom: string; verifie: boolean } | null
}

const ANNONCES_PAR_PAGE = 9

export default function PageToutesAnnonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [chargement, setChargement] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [ville, setVille] = useState('')
  const [type_bien, setTypeBien] = useState('')
  const [budget, setBudget] = useState('')

  useEffect(() => {
    chargerAnnonces(1)
  }, [])

  async function chargerAnnonces(nouvellePage: number, filtres?: {
    ville?: string
    type_bien?: string
    budget?: string
  }) {
    setChargement(true)

    const debut = (nouvellePage - 1) * ANNONCES_PAR_PAGE
    const fin = debut + ANNONCES_PAR_PAGE - 1

    let query = supabase
      .from('annonces')
      .select('*, agents(nom, verifie)', { count: 'exact' })
      .eq('statut', 'disponible')
      .order('created_at', { ascending: false })
      .range(debut, fin)

    const v = filtres?.ville ?? ville
    const t = filtres?.type_bien ?? type_bien
    const b = filtres?.budget ?? budget

    if (v) query = query.eq('ville', v)
    if (t) query = query.eq('type_bien', t)
    if (b) query = query.lte('prix', parseInt(b))

    const { data, error, count } = await query

    if (error) {
      console.error(error)
    } else {
      setAnnonces(data || [])
      setTotal(count || 0)
      setPage(nouvellePage)
    }

    setChargement(false)
  }

  async function appliquerFiltres() {
    await chargerAnnonces(1, { ville, type_bien, budget })
  }

  async function reinitialiserFiltres() {
    setVille('')
    setTypeBien('')
    setBudget('')
    await chargerAnnonces(1, { ville: '', type_bien: '', budget: '' })
  }

  const totalPages = Math.ceil(total / ANNONCES_PAR_PAGE)

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      {/* FILTRES */}
      <section className="bg-blue-800 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Toutes les annonces</h1>
          <div className="bg-white rounded-lg p-4 flex flex-col sm:flex-row gap-3">
            <select
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Toutes les villes</option>
              <option value="Yaoundé">Yaoundé</option>
              <option value="Douala">Douala</option>
              <option value="Bafoussam">Bafoussam</option>
              <option value="Garoua">Garoua</option>
            </select>

            <select
              value={type_bien}
              onChange={(e) => setTypeBien(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tous les types</option>
              <option value="studio">Studio</option>
              <option value="appartement">Appartement</option>
              <option value="villa">Villa</option>
              <option value="maison">Maison</option>
            </select>

            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Budget maximum</option>
              <option value="50000">50 000 FCFA</option>
              <option value="100000">100 000 FCFA</option>
              <option value="200000">200 000 FCFA</option>
              <option value="500000">500 000 FCFA</option>
            </select>

            <button
              onClick={appliquerFiltres}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-md transition text-sm"
            >
              Filtrer
            </button>

            <button
              onClick={reinitialiserFiltres}
              className="bg-white border border-gray-300 text-gray-600 hover:border-blue-400 font-medium px-6 py-3 rounded-md transition text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* ANNONCES */}
      <section className="max-w-5xl mx-auto px-6 py-10">

        {chargement ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Chargement des annonces...</p>
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 font-medium mb-2">Aucun logement trouvé</p>
            <p className="text-gray-400 text-sm">Essayez d'élargir vos critères de recherche.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {total} logement{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {annonces.map((annonce) => (
                <div key={annonce.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                  {annonce.photos && annonce.photos.length > 0 ? (
                    <img
                      src={annonce.photos[0]}
                      alt={annonce.titre}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="h-44 bg-gray-200"></div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{annonce.titre}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Disponible
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{annonce.quartier}, {annonce.ville}</p>
                    <p className="text-blue-800 font-bold text-base mb-4">
                      {annonce.prix.toLocaleString('fr-FR')} FCFA / mois
                    </p>
                    <div className="flex gap-2 text-xs text-gray-500 mb-4 flex-wrap">
                      {annonce.nombre_pieces && (
                        <span className="border border-gray-200 rounded px-2 py-1">
                          {annonce.nombre_pieces} pièce{annonce.nombre_pieces > 1 ? 's' : ''}
                        </span>
                      )}
                      {annonce.superficie && (
                        <span className="border border-gray-200 rounded px-2 py-1">
                          {annonce.superficie} m²
                        </span>
                      )}
                      {annonce.agents?.verifie && (
                        <span className="border border-green-200 text-green-600 rounded px-2 py-1">
                          Agent vérifié
                        </span>
                      )}
                    </div>
                    {annonce.agents && (
                      <p className="text-xs text-gray-400 mb-3">Par {annonce.agents.nom}</p>
                    )}
                    <Link
                      href={`/annonces/${annonce.id}`}
                      className="block w-full border border-blue-800 text-blue-800 py-2 rounded-md text-sm font-medium hover:bg-blue-800 hover:text-white transition text-center"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => chargerAnnonces(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:border-blue-800 hover:text-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => chargerAnnonces(num)}
                    className={`px-4 py-2 text-sm rounded-md transition ${
                      num === page
                        ? 'bg-blue-800 text-white'
                        : 'border border-gray-300 text-gray-600 hover:border-blue-800 hover:text-blue-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => chargerAnnonces(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:border-blue-800 hover:text-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </section>

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