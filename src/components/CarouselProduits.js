import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function CarouselProduits({ produits }) {
  const navigate = useNavigate()
  const trackRef = useRef(null)

  // On duplique les produits pour un défilement infini
  const items = [...produits, ...produits, ...produits]

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animationId
    let position = 0
    const speed = 0.5 // pixels par frame — ultra fluide

    const animate = () => {
      position += speed
      const singleWidth = track.scrollWidth / 3
      if (position >= singleWidth) {
        position = 0
      }
      track.style.transform = `translateX(-${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [produits])

  if (produits.length === 0) return null

  return (
    <div className="w-full overflow-hidden bg-white py-4 border-b border-gray-100">
      <div
        ref={trackRef}
        className="flex gap-3 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {items.map((produit, index) => (
          <div
            key={`${produit.id}-${index}`}
            onClick={() => navigate(`/boutique/${produit.boutiques?.id}`)}
            className="flex-shrink-0 w-32 sm:w-40 cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-xl bg-gray-50 shadow-sm border border-gray-100 group-hover:border-green-300 group-hover:shadow-md transition-all duration-200"
              style={{ paddingBottom: '100%' }}
            >
              <div className="absolute inset-0">
                {produit.image_url ? (
                  <img
                    src={produit.image_url}
                    alt={produit.nom}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
              </div>
              {/* Prix overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-bold">
                  {produit.prix.toLocaleString()} GNF
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1 font-medium px-1">
              {produit.nom}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
