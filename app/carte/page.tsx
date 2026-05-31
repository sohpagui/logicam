import { supabase } from '@/lib/supabase'
import NavBar from '../components/NavBar'
import CarteAnnonces from '../components/CarteAnnonces'
import Link from 'next/link'

async function getAnnonces() {
  const { data, error } = await supabase
    .from('annonces')
    .select('id, titre, quartier, ville, prix')
    .eq('statut', 'disponible')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export default async function PageCarte() {
  const annonces = await getAnnonces()

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Carte des logements</h1>
            <p className="text-sm text-gray-500 mt-1">
              {annonces.length} logement{annonces.length > 1 ? 's' : ''} disponible{annonces.length > 1 ? 's' : ''} au Cameroun
            </p>
          </div>
          <Link
            href="/annonces"
            className="text-sm text-blue-800 font-medium hover:underline"
          >
            Voir en liste
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
          <CarteAnnonces annonces={annonces} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-sm text-gray-500">
            Cliquez sur un marqueur pour voir les détails du logement. Les positions sont approximatives par quartier.
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