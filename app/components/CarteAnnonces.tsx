'use client'

import { useEffect, useRef } from 'react'

type Annonce = {
  id: string
  titre: string
  quartier: string
  ville: string
  prix: number
  latitude?: number
  longitude?: number
}

type Props = {
  annonces: Annonce[]
}

const COORDONNEES_VILLES: Record<string, [number, number]> = {
  'Yaoundé': [3.848, 11.502],
  'Douala': [4.061, 9.778],
  'Bafoussam': [5.478, 10.417],
  'Garoua': [9.301, 13.397],
}

const COORDONNEES_QUARTIERS: Record<string, [number, number]> = {
  'Bastos': [3.879, 11.516],
  'Akwa': [4.054, 9.699],
  'Bonapriso': [4.071, 9.693],
  'Bonamoussadi': [4.090, 9.745],
  'Mendong': [3.821, 11.478],
  'Etoudi': [3.889, 11.523],
  'Nlongkak': [3.867, 11.511],
  'Mvog-Mbi': [3.840, 11.517],
  'Biyem-Assi': [3.831, 11.490],
  'Omnisports': [3.869, 11.523],
  'Mvan': [3.830, 11.530],
  'Nkol-Eton': [3.855, 11.505],
  'Deido': [4.068, 9.718],
  'Makepe': [4.088, 9.758],
  'Logbessou': [4.102, 9.772],
  'Fontaine': [5.470, 10.410],
}

export default function CarteAnnonces({ annonces }: Props) {
  const carteRef = useRef<HTMLDivElement>(null)
  const carteInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!carteRef.current || carteInstanceRef.current) return

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const carte = L.map(carteRef.current!).setView([4.061, 11.502], 6)
      carteInstanceRef.current = carte

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(carte)

      annonces.forEach((annonce) => {
        let coords: [number, number] | null = null

        const quartierNormalise = Object.keys(COORDONNEES_QUARTIERS).find(
          q => annonce.quartier?.toLowerCase().includes(q.toLowerCase())
        )

        if (quartierNormalise) {
          coords = COORDONNEES_QUARTIERS[quartierNormalise]
        } else if (COORDONNEES_VILLES[annonce.ville]) {
          const base = COORDONNEES_VILLES[annonce.ville]
          coords = [
            base[0] + (Math.random() - 0.5) * 0.02,
            base[1] + (Math.random() - 0.5) * 0.02
          ]
        }

        if (coords) {
          const marqueur = L.marker(coords).addTo(carte)
          marqueur.bindPopup(`
            <div style="min-width: 180px;">
              <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px 0; color: #1e3a5f;">
                ${annonce.titre}
              </p>
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0;">
                ${annonce.quartier}, ${annonce.ville}
              </p>
              <p style="font-weight: 700; font-size: 13px; color: #1e40af; margin: 0 0 8px 0;">
                ${annonce.prix.toLocaleString('fr-FR')} FCFA / mois
              </p>
              <a href="/annonces/${annonce.id}"
                style="display: block; text-align: center; background: #1e40af; color: white;
                padding: 6px 12px; border-radius: 6px; font-size: 12px; text-decoration: none;">
                Voir les détails
              </a>
            </div>
          `)
        }
      })
    })

    return () => {
      if (carteInstanceRef.current) {
        carteInstanceRef.current.remove()
        carteInstanceRef.current = null
      }
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        ref={carteRef}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
      />
    </>
  )
}