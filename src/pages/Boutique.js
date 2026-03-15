import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CarteProduit from '../components/CarteProduit'
import Avis from '../components/Avis'
import { CATEGORIES } from '../lib/categories'

export default function Boutique() {
  const [boutique, setBoutique] = useState(null)
  const [produits, setProduits] = useState([])
  const [suivi, setSuivi] = useState(false)
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('produits')
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBoutique()
    fetchProduits()
    if (user) verifierSuivi()
  }, [id, user])

  const fetchBoutique = async () => {
    const { data } = await supabase
      .from('boutiques')
      .select('*')
      .eq('id', id)
      .single()
    setBoutique(data)
    setLoading(false)

    if (data) {
      await supabase.from('vues').insert({
        boutique_id: id,
        visiteur_id: user?.id || null
      })
    }
  }

  const fetchProduits = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*')
      .eq('boutique_id', id)
      .order('created_at', { ascending: false })
    setProduits(data || [])
  }

  const verifierSuivi = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('acheteur_id', user.id)
      .eq('boutique_id', id)
      .maybeSingle()
    setSuivi(!!data)
  }

  const toggleSuivi = async () => {
    if (!user) { navigate('/connexion'); return }
    if (suivi) {
      await supabase.from('follows')
        .delete()
        .eq('acheteur_id', user.id)
        .eq('boutique_id', id)
      setBoutique({ ...boutique, followers_count: boutique.followers_count - 1 })
    } else {
      await supabase.from('follows')
        .insert({ acheteur_id: user.id, boutique_id: id })
      setBoutique({ ...boutique, followers_count: boutique.followers_count + 1 })
      await supabase.from('notifications').insert({
        user_id: boutique.vendeur_id,
        type: 'follow',
        message: `Quelqu'un a commencé à suivre ta boutique "${boutique.nom}" !`,
        lien: `/dashboard`
      })
    }
    setSuivi(!suivi)
  }

  const estProprietaire = user && boutique && user.id === boutique.vendeur_id

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <p>Chargement...</p>
    </div>
  )

  if (!boutique) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <p>Boutique introuvable</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border-2 border-green-200 flex-shrink-0">
              {boutique.logo_url ? (
                <img src={boutique.logo_url} alt={boutique.nom} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">Logo</span>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{boutique.nom}</h1>
              <p className="text-gray-500 text-sm mt-1">{boutique.description}</p>
              {boutique.categories && boutique.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
                  {boutique.categories.map(cat => {
                    const catInfo = CATEGORIES.find(c => c.id === cat)
                    return catInfo ? (
                      <span key={cat} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">
                        {catInfo.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
              <p className="text-gray-400 text-xs mt-2">
                {boutique.followers_count} followers • {produits.length} produits
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href={`https://wa.me/${boutique.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold text-center hover:bg-green-600 transition text-sm sm:text-base"
            >
              Contacter sur WhatsApp
            </a>
            {!estProprietaire && (
              <button
                onClick={toggleSuivi}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition ${
                  suivi ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {suivi ? 'Suivi' : '+ Suivre'}
              </button>
            )}
            {estProprietaire && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/creer-boutique')}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                  Modifier
                </button>
                <button
                  onClick={() => navigate(`/ajouter-produit/${boutique.id}`)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition"
                >
                  + Produit
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm sticky top-0 z-10 mt-1">
        <div className="max-w-6xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('produits')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'produits' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
            }`}
          >
            Produits ({produits.length})
          </button>
          <button
            onClick={() => setOnglet('avis')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'avis' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
            }`}
          >
            Avis
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {onglet === 'produits' && (
          produits.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Aucun produit pour l'instant</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {produits.map(produit => (
                <CarteProduit key={produit.id} produit={produit} whatsapp={boutique.whatsapp} />
              ))}
            </div>
          )
        )}
        {onglet === 'avis' && <Avis boutiqueId={id} vendeurId={boutique.vendeur_id} />}
      </div>
    </div>
  )
}
