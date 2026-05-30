import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import NavBar from './components/NavBar'

async function getAnnonces() {
  const { data, error } = await supabase
    .from('annonces')
    .select('*, agents(nom, note, verifie)')
    .eq('statut', 'disponible')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export default async function Home() {
  const annonces = await getAnnonces()

  return (
    <main className="min-h-screen bg-gray-50">

      <NavBar />

      {/* HERO */}
      <section className="bg-blue-800 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Trouvez votre logement au Cameroun
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Des annonces vérifiées à Yaoundé, Douala et dans les principales villes du pays
          </p>
          <div className="bg-white rounded-lg p-4 flex flex-col sm:flex-row gap-3 shadow-lg">
            <select className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option value="">Ville</option>
              <option value="yaounde">Yaoundé</option>
              <option value="douala">Douala</option>
              <option value="bafoussam">Bafoussam</option>
              <option value="garoua">Garoua</option>
            </select>
            <select className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option value="">Type de logement</option>
              <option value="studio">Studio</option>
              <option value="appartement">Appartement</option>
              <option value="villa">Villa</option>
              <option value="maison">Maison</option>
            </select>
            <select className="flex-1 border border-gray-300 rounded-md px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option value="">Budget maximum</option>
              <option value="50000">50 000 FCFA</option>
              <option value="100000">100 000 FCFA</option>
              <option value="200000">200 000 FCFA</option>
              <option value="500000">500 000 FCFA</option>
            </select>
            <Link href="/recherche" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-md transition text-sm">
              Rechercher
            </Link>
          </div>
        </div>
      </section>

      {/* CHIFFRES */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-gray-200">
          <div className="py-8 text-center">
            <p className="text-3xl font-bold text-blue-800">{annonces.length}</p>
            <p className="text-sm text-gray-500 mt-1">Annonces actives</p>
          </div>
          <div className="py-8 text-center">
            <p className="text-3xl font-bold text-blue-800">3</p>
            <p className="text-sm text-gray-500 mt-1">Agents vérifiés</p>
          </div>
          <div className="py-8 text-center">
            <p className="text-3xl font-bold text-blue-800">2</p>
            <p className="text-sm text-gray-500 mt-1">Villes couvertes</p>
          </div>
        </div>
      </section>

      {/* ANNONCES */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">Annonces récentes</h2>
          <Link href="/recherche" className="text-sm text-blue-800 font-medium hover:underline">
            Voir toutes les annonces
          </Link>
        </div>

        {annonces.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Aucune annonce disponible pour le moment.</p>
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
                    {annonce.agents?.verifie && (
                      <span className="border border-green-200 text-green-600 rounded px-2 py-1">
                        Agent vérifié
                      </span>
                    )}
                  </div>
                  {annonce.agents && (
                    <p className="text-xs text-gray-400 mb-3">
                      Par {annonce.agents.nom}
                    </p>
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
        )}
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="bg-white border-t border-gray-200 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-10">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm">1</div>
              <h3 className="font-semibold text-gray-800 mb-2">Recherchez</h3>
              <p className="text-sm text-gray-500">Filtrez par ville, quartier, type de logement et budget selon vos besoins.</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm">2</div>
              <h3 className="font-semibold text-gray-800 mb-2">Analysez</h3>
              <p className="text-sm text-gray-500">Consultez les photos, les détails et les avis sur l'agent avant de décider.</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-blue-800 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm">3</div>
              <h3 className="font-semibold text-gray-800 mb-2">Contactez</h3>
              <p className="text-sm text-gray-500">Échangez directement avec un agent vérifié via notre messagerie sécurisée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white font-bold text-lg">LogiCam</span>
          <p className="text-blue-300 text-sm">La plateforme immobilière de confiance au Cameroun</p>
          <p className="text-blue-400 text-xs">© 2026 LogiCam</p>
        </div>
      </footer>

    </main>
  )
}