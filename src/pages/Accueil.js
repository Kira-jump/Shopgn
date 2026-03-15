import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../lib/categories'
import CarteBoutique from '../components/CarteBoutique'

export default function Accueil() {
  const [boutiques, setBoutiques] = useState([])
  const [loading, setLoading] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [categorieActive, setCategorieActive] = useState('tout')
  const { user } = useAuth()

  useEffect(() => {
    fetchBoutiques()
  }, [])

  const fetchBoutiques = async () => {
    const { data } = await supabase
      .from('boutiques')
      .select('*')
      .order('created_at', { ascending: false })
    setBoutiques(data || [])
    setLoading(false)
  }

  const boutiquesFiltrees = boutiques.filter(b => {
    const matchRecherche = b.nom.toLowerCase().includes(recherche.toLowerCase())
    const matchCategorie = categorieActive === 'tout' ||
      (b.categories && b.categories.includes(categorieActive))
    return matchRecherche && matchCategorie
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-green-600 text-white py-8 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          🛍️ GuinéeShop
        </h1>
        <p className="text-green-100 mb-5 text-sm sm:text-base">
          La marketplace des vendeurs guinéens
        </p>
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="🔍 Rechercher une boutique..."
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  categorieActive === cat.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Boutiques */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-700">
            {categorieActive === 'tout'
              ? 'Toutes les boutiques'
              : CATEGORIES.find(c => c.id === categorieActive)?.label}
          </h2>
          <span className="text-gray-400 text-sm">
            {boutiquesFiltrees.length} résultat{boutiquesFiltrees.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">⏳</p>
            <p>Chargement...</p>
          </div>
        ) : boutiquesFiltrees.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🏪</p>
            <p>Aucune boutique trouvée</p>
            {categorieActive !== 'tout' && (
              <button
                onClick={() => setCategorieActive('tout')}
                className="mt-3 text-green-600 underline text-sm"
              >
                Voir toutes les boutiques
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boutiquesFiltrees.map(boutique => (
              <CarteBoutique
                key={boutique.id}
                boutique={boutique}
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
