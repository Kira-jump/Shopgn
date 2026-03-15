import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CarteBoutique from '../components/CarteBoutique'

export default function Feed() {
  const [boutiques, setBoutiques] = useState([])
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('boutiques')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    fetchFeed()
  }, [user])

  const fetchFeed = async () => {
    // Récupère les boutiques suivies
    const { data: follows } = await supabase
      .from('follows')
      .select('boutique_id')
      .eq('acheteur_id', user.id)

    if (!follows || follows.length === 0) {
      setLoading(false)
      return
    }

    const boutiqueIds = follows.map(f => f.boutique_id)

    // Récupère les boutiques
    const { data: boutiquesData } = await supabase
      .from('boutiques')
      .select('*')
      .in('id', boutiqueIds)
      .order('created_at', { ascending: false })

    setBoutiques(boutiquesData || [])

    // Récupère les derniers produits de ces boutiques
    const { data: produitsData } = await supabase
      .from('produits')
      .select('*, boutiques(nom, logo_url, whatsapp)')
      .in('boutique_id', boutiqueIds)
      .order('created_at', { ascending: false })
      .limit(20)

    setProduits(produitsData || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-4xl mb-3">⏳</p>
        <p>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-6 px-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">📰 Mon Feed</h1>
        <p className="text-green-100 text-sm">Les boutiques et produits que tu suis</p>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('boutiques')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'boutiques'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            🏪 Boutiques ({boutiques.length})
          </button>
          <button
            onClick={() => setOnglet('produits')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'produits'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📦 Nouveautés ({produits.length})
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {boutiques.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏪</p>
            <p className="font-semibold text-gray-600 mb-2">Ton feed est vide</p>
            <p className="text-sm mb-4">Suis des boutiques pour voir leurs nouveautés ici</p>
            <button
              onClick={() => navigate('/')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Découvrir des boutiques
            </button>
          </div>
        ) : (
          <>
            {onglet === 'boutiques' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {boutiques.map(boutique => (
                  <CarteBoutique
                    key={boutique.id}
                    boutique={boutique}
                    userId={user?.id}
                  />
                ))}
              </div>
            )}

            {onglet === 'produits' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {produits.map(produit => (
                  <div
                    key={produit.id}
                    className="bg-white rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden border border-gray-100 hover:-translate-y-1 duration-200"
                  >
                    <div className="h-36 sm:h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {produit.image_url ? (
                        <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>
                    <div className="p-3">
                      {/* Nom boutique */}
                      <div
                        onClick={() => navigate(`/boutique/${produit.boutique_id}`)}
                        className="flex items-center gap-1.5 mb-2 cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-full bg-green-50 overflow-hidden flex-shrink-0">
                          {produit.boutiques?.logo_url ? (
                            <img src={produit.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">🏪</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 hover:text-green-600 truncate">
                          {produit.boutiques?.nom}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{produit.nom}</h3>
                      <p className="text-green-600 font-bold text-sm mt-1">
                        {produit.prix.toLocaleString()} GNF
                      </p>
                      <a
                        href={`https://wa.me/${produit.boutiques?.whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par: ${produit.nom} à ${produit.prix.toLocaleString()} GNF`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-2 bg-green-500 text-white text-xs text-center py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        💬 Commander
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
