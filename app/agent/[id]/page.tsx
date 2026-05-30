import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NavBar from '../../components/NavBar'
import FormulaireNote from '../../components/FormulaireNote'

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

async function getNotes(agentId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('agent_id', agentId)
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
  const notes = await getNotes(id)
  const moyenneNote = notes.length > 0
    ? (notes.reduce((acc, n) => acc + n.note, 0) / notes.length).toFixed(1)
    : null

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* PROFIL */}
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
                    {moyenneNote ? `${moyenneNote}/5` : '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Note moyenne</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-blue-800">{notes.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Avis reçus</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ANNONCES */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Annonces de {agent.nom}
            </h2>

            {annonces.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-400 text-sm">Cet agent n'a pas encore publié d'annonce.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {annonces.map((annonce) => (
                  <div key={annonce.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition flex">
                    {annonce.photos && annonce.photos.length > 0 ? (
                      <img
                        src={annonce.photos[0]}
                        alt={annonce.titre}
                        className="w-32 h-28 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-32 h-28 bg-gray-200 flex-shrink-0"></div>
                    )}
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{annonce.titre}</h3>
                      <p className="text-xs text-gray-500 mb-2">{annonce.quartier}, {annonce.ville}</p>
                      <p className="text-blue-800 font-bold text-sm mb-3">
                        {annonce.prix.toLocaleString('fr-FR')} FCFA / mois
                      </p>
                      <Link
                        href={`/annonces/${annonce.id}`}
                        className="text-xs border border-blue-800 text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-800 hover:text-white transition"
                      >
                        Voir les détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NOTES ET AVIS */}
          <div className="lg:col-span-1 space-y-6">

            {/* FORMULAIRE DE NOTE */}
            <FormulaireNote agentId={id} agentNom={agent.nom} />

            {/* AVIS RECUS */}
            {notes.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Avis des locataires</h3>
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < note.note ? 'text-orange-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {note.commentaire && (
                        <p className="text-xs text-gray-600 leading-relaxed">{note.commentaire}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(note.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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