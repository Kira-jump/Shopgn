import { useState } from 'react'
import ImageViewer from './ImageViewer'

export default function CarteProduit({ produit, whatsapp }) {
  const [viewerOuvert, setViewerOuvert] = useState(false)
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`
  )

  return (
    <>
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1 duration-200">
        {/* Image cliquable */}
        <div
          className="h-36 sm:h-44 bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in"
          onClick={() => produit.image_url && setViewerOuvert(true)}
        >
          {produit.image_url ? (
            <img
              src={produit.image_url}
              alt={produit.nom}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">📦</span>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-1">
            {produit.nom}
          </h3>
          {produit.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{produit.description}</p>
          )}
          <p className="text-green-600 font-bold text-sm sm:text-base mt-1">
            {produit.prix.toLocaleString()} GNF
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=${message}`}
            target="_blank"
            rel="noreferrer"
            className="block mt-2 bg-green-500 text-white text-xs sm:text-sm text-center py-2 rounded-lg hover:bg-green-600 transition font-medium"
          >
            Commander via WhatsApp
          </a>
        </div>
      </div>

      {/* Viewer plein écran */}
      {viewerOuvert && (
        <ImageViewer
          image={produit.image_url}
          nom={produit.nom}
          onClose={() => setViewerOuvert(false)}
        />
      )}
    </>
  )
}
