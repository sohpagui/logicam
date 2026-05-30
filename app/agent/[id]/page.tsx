import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NavBar from '../../components/NavBar'

async function getAgent(id: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

async function getAnnoncesAgent(agentId: string) {
  const { data, error } = await supabase
    .from('annonces')
    .select('*')
    .eq('agent_id', agentId)
    .eq('statut', 'disponible')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export default async function PageProfilAgent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = await getAgent(id)

  if (!agent) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Agent introuvable.</p>
          <Link href="/" className="text-blue-800 font-medium hover:underline mt-4 block">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    )
  }

  const annonces = await getAnnoncesAgent(id)

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-3xl flex-shrink-0">
              {agent.nom.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-800">{agent.nom}</h1>
                {agent.verifie && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    Agent vérifié
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-4">{agent.ville}</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-blue-800">{annonces.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Annonces actives</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-blue-800">
                    {agent.note > 0 ? `${agent.note}/5` : '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Note moyenne</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-blue-800">
                    {agent.verifie ? 'Oui' : 'Non'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Vérifié</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Annonces de {agent.nom}
          </h2>

          {annonces.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-400 text-sm">Cet agent n'a pas encore publié d'annonce.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </div>
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
          )}
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