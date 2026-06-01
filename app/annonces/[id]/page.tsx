import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NavBar from '../../components/NavBar'
import CarteAgent from '../../components/CarteAgent'

async function getAnnonce(id: string) {
  const { data, error } = await supabase
    .from('annonces')
    .select('*, agents(nom, telephone, email, note, verifie, photo_profil)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erreur supabase:', error)
    return null
  }
  return data
}

export default async function PageAnnonce({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const annonce = await getAnnonce(id)

  if (!annonce) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Annonce introuvable.</p>
          <Link href="/" className="text-blue-800 font-medium hover:underline mt-4 block">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* PHOTOS */}
        {annonce.photos && annonce.photos.length > 0 ? (
          <div className="mb-8">
            <img
              src={annonce.photos[0]}
              alt={annonce.titre}
              className="w-full h-72 object-cover rounded-lg"
            />
            {annonce.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {annonce.photos.slice(1).map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index + 2}`}
                    className="w-full h-20 object-cover rounded-md border border-gray-200"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-72 bg-gray-200 rounded-lg mb-8"></div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* DETAILS ANNONCE */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{annonce.titre}</h1>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                {annonce.statut === 'disponible' ? 'Disponible' : 'Bientôt disponible'}
              </span>
            </div>

            <p className="text-gray-500 text-sm mb-6">{annonce.quartier}, {annonce.ville}</p>

            <p className="text-blue-800 font-bold text-2xl mb-8">
              {annonce.prix.toLocaleString('fr-FR')} FCFA / mois
            </p>

            {/* CARACTERISTIQUES */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {annonce.nombre_pieces && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-gray-800">{annonce.nombre_pieces}</p>
                  <p className="text-xs text-gray-500 mt-1">Pièces</p>
                </div>
              )}
              {annonce.superficie && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-gray-800">{annonce.superficie} m²</p>
                  <p className="text-xs text-gray-500 mt-1">Superficie</p>
                </div>
              )}
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xl font-bold text-gray-800 capitalize">{annonce.type_bien}</p>
                <p className="text-xs text-gray-500 mt-1">Type</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{annonce.description}</p>
            </div>
          </div>

          {/* CARTE AGENT */}
          <div className="lg:col-span-1">
            {annonce.agents && (
              <CarteAgent
                agent={annonce.agents}
                agentId={annonce.agent_id}
                annonceId={annonce.id}
              />
            )}
          </div>

        </div>
      </div>

      <footer className="bg-blue-900 py-8 px-6 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold text-lg">LogiCam</span>
          <p className="text-blue-300 text-sm">La plateforme immobilière de confiance au Cameroun</p>
          <p className="text-blue-400 text-xs">© 2026 LogiCam</p>
        </div>
      </footer>

    </main>
  )
}