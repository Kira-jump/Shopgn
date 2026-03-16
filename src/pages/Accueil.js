import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../lib/categories'
import { useNavigate } from 'react-router-dom'

export default function Accueil() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorieActive, setCategorieActive] = useState('tout')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduits()
  }, [])

  const fetchProduits = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*, boutiques(id, nom, logo_url, whatsapp, categories)')
      .order('created_at', { ascending: false })
    setProduits(data || [])
    setLoading(false)
  }

  const produitsFiltres = produits.filter(p => {
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      p.boutiques?.nom.toLowerCase().includes(recherche.toLowerCase())
    const matchCategorie = categorieActive === 'tout' ||
      (p.boutiques?.categories && p.boutiques.categories.includes(categorieActive))
    return matchRecherche && matchCategorie
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-green-600 text-white py-8 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          ShopGN
        </h1>
        <p className="text-green-100 mb-5 text-sm sm:text-base">
          La marketplace des vendeurs guinéens
        </p>
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un produit ou une boutique..."
            className="w-full px-4 py-3 rounded-xl text-gray-700 focus:outline-none shadow-md text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Catégories */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategorieActive(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  categorieActive === cat.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-700">
            {categorieActive === 'tout'
              ? 'Tous les produits'
              : CATEGORIES.find(c => c.id === categorieActive)?.label}
          </h2>
          <span className="text-gray-400 text-sm">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {produitsFiltres.map(produit => (
              <div
                key={produit.id}
                onClick={() => navigate(`/boutique/${produit.boutiques?.id}`)}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1 duration-200 cursor-pointer"
              >
                {/* Image produit */}
                <div className="h-40 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {produit.image_url ? (
                    <img
                      src={produit.image_url}
                      alt={produit.nom}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-300">
                      <p className="text-4xl">📦</p>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  {/* Boutique */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-full bg-green-50 overflow-hidden flex-shrink-0 border border-green-100">
                      {produit.boutiques?.logo_url ? (
                        <img src={produit.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-green-200" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 truncate">
                      {produit.boutiques?.nom}
                    </span>
                  </div>

                  {/* Nom produit */}
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                    {produit.nom}
                  </h3>

                  {/* Prix */}
                  <p className="text-green-600 font-bold text-sm mt-1">
                    {produit.prix.toLocaleString()} GNF
                  </p>

                  {/* Bouton Commander */}
                  <a
                    href={`https://wa.me/${produit.boutiques?.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block mt-2 bg-green-500 text-white text-xs text-center py-2 rounded-lg hover:bg-green-600 transition font-medium"
                  >
                    Commander
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
