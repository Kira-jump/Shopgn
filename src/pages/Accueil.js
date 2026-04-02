import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../lib/categories'
import { useNavigate } from 'react-router-dom'
import ImageViewer from '../components/ImageViewer'
import CarouselProduits from '../components/CarouselProduits'

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Accueil() {
  const [produits, setProduits] = useState([])
  const [produitsMelanges, setProduitsMelanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorieActive, setCategorieActive] = useState('tout')
  const [imageSelectionnee, setImageSelectionnee] = useState(null)
  const [animation, setAnimation] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduits()
  }, [])

  const melangerProduits = useCallback((liste) => {
    setAnimation(true)
    setTimeout(() => {
      setProduitsMelanges(shuffleArray(liste))
      setAnimation(false)
    }, 300)
  }, [])

  useEffect(() => {
    if (produits.length > 0) {
      melangerProduits(produits)
      const interval = setInterval(() => {
        melangerProduits(produits)
      }, 15000)
      return () => clearInterval(interval)
    }
  }, [produits, melangerProduits])

  const fetchProduits = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*, boutiques(id, nom, logo_url, whatsapp)')
    setProduits(data || [])
    setLoading(false)
  }

  const produitsFiltres = produitsMelanges.filter(p => {
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      p.boutiques?.nom.toLowerCase().includes(recherche.toLowerCase())
    const matchCategorie = categorieActive === 'tout' || p.categorie === categorieActive
    return matchRecherche && matchCategorie
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-green-600 text-white py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
          ShopGN
        </h1>
        <p className="text-green-100 mb-6 text-sm sm:text-base max-w-md mx-auto">
          La marketplace des vendeurs guinéens
        </p>
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit ou une boutique..."
            className="w-full px-5 py-3 rounded-full text-gray-700 focus:outline-none shadow-lg text-sm"
          />
          <span className="absolute right-4 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Carousel défilant */}
      {!loading && produits.length > 0 && (
        <CarouselProduits produits={shuffleArray(produits)} />
      )}

      {/* Catégories */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategorieActive(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                  categorieActive === cat.id
                    ? 'bg-green-600 text-white border-green-600 shadow'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {categorieActive === 'tout'
              ? 'Tous les produits'
              : CATEGORIES.find(c => c.id === categorieActive)?.label}
          </h2>
          <span className="text-gray-400 text-sm bg-gray-100 px-3 py-1 rounded-full">
            {produitsFiltres.length} produit{produitsFiltres.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p>Chargement...</p>
          </div>
        ) : produitsFiltres.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Aucun produit trouvé</p>
            {categorieActive !== 'tout' && (
              <button
                onClick={() => setCategorieActive('tout')}
                className="mt-3 text-green-600 underline text-sm"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 transition-opacity duration-300 ${
              animation ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {produitsFiltres.map(produit => (
              <div
                key={produit.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all duration-200 group"
              >
                <div
                  className="relative overflow-hidden bg-gray-50 cursor-zoom-in"
                  style={{ paddingBottom: '100%' }}
                  onClick={() => produit.image_url && setImageSelectionnee(produit)}
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
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <div
                    className="flex items-center gap-1.5 mb-2 cursor-pointer"
                    onClick={() => navigate(`/boutique/${produit.boutiques?.id}`)}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                      {produit.boutiques?.logo_url ? (
                        <img src={produit.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-green-100" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 truncate hover:text-green-600 transition">
                      {produit.boutiques?.nom}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight mb-2">
                    {produit.nom}
                  </h3>

                  <p className="text-green-600 font-bold text-base mb-3">
                    {produit.prix.toLocaleString()} GNF
                  </p>

                  <a
                    href={`https://wa.me/${produit.boutiques?.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-green-600 text-white text-xs text-center py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Commander
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image viewer */}
      {imageSelectionnee && (
        <ImageViewer
          image={imageSelectionnee.image_url}
          nom={imageSelectionnee.nom}
          onClose={() => setImageSelectionnee(null)}
        />
      )}
    </div>
  )
}
