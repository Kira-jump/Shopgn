import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ImageViewer from './ImageViewer'

export default function CarteProduit({ produit, whatsapp, estProprietaire, onSupprimer, onModifier }) {
  const [viewerOuvert, setViewerOuvert] = useState(false)
  const [confirmSupprimer, setConfirmSupprimer] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const message = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`
  )

  const handleCommander = (e) => {
    if (!user) {
      e.preventDefault()
      navigate('/connexion')
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1 duration-200">
        <div
          className="h-36 sm:h-44 bg-gray-50 flex items-center justify-center overflow-hidden cursor-zoom-in relative"
          onClick={() => produit.image_url && setViewerOuvert(true)}
        >
          {produit.image_url ? (
            <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">📦</span>
          )}

          {estProprietaire && (
            <div className="absolute top-2 right-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onModifier(produit)}
                className="bg-white text-blue-600 w-7 h-7 rounded-full shadow flex items-center justify-center text-xs hover:bg-blue-50 transition"
              >
                ✏️
              </button>
              <button
                onClick={() => setConfirmSupprimer(true)}
                className="bg-white text-red-600 w-7 h-7 rounded-full shadow flex items-center justify-center text-xs hover:bg-red-50 transition"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-1">{produit.nom}</h3>
          {produit.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{produit.description}</p>
          )}
          <p className="text-green-600 font-bold text-sm sm:text-base mt-1">
            {produit.prix.toLocaleString()} GNF
          </p>
          {!estProprietaire && (
            user ? (
              <a
                href={`https://wa.me/${whatsapp}?text=${message}`}
                target="_blank"
                rel="noreferrer"
                className="block mt-2 bg-green-500 text-white text-xs sm:text-sm text-center py-2 rounded-lg hover:bg-green-600 transition font-medium"
              >
                Commander via WhatsApp
              </a>
            ) : (
              <button
                onClick={() => navigate('/connexion')}
                className="block w-full mt-2 bg-gray-100 text-gray-600 text-xs sm:text-sm text-center py-2 rounded-lg hover:bg-green-50 hover:text-green-600 transition font-medium border border-gray-200"
              >
                Connectez-vous pour commander
              </button>
            )
          )}
        </div>
      </div>

      {confirmSupprimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Supprimer ce produit ?</h3>
            <p className="text-gray-500 text-sm mb-4">"{produit.nom}" sera définitivement supprimé.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSupprimer(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => { onSupprimer(produit.id); setConfirmSupprimer(false) }}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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
