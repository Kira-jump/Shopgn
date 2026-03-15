import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CarteBoutique({ boutique, userId }) {
  const [suivi, setSuivi] = useState(false)
  const [followersCount, setFollowersCount] = useState(boutique.followers_count)
  const navigate = useNavigate()

  useEffect(() => {
    if (userId) verifierSuivi()
  }, [userId])

  const verifierSuivi = async () => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('acheteur_id', userId)
      .eq('boutique_id', boutique.id)
      .maybeSingle()
    setSuivi(!!data)
  }

  const toggleSuivi = async (e) => {
    e.stopPropagation()
    if (!userId) { navigate('/connexion'); return }
    if (suivi) {
      await supabase.from('follows')
        .delete()
        .eq('acheteur_id', userId)
        .eq('boutique_id', boutique.id)
      await supabase.from('boutiques')
        .update({ followers_count: followersCount - 1 })
        .eq('id', boutique.id)
      setFollowersCount(followersCount - 1)
    } else {
      await supabase.from('follows')
        .insert({ acheteur_id: userId, boutique_id: boutique.id })
      await supabase.from('boutiques')
        .update({ followers_count: followersCount + 1 })
        .eq('id', boutique.id)
      setFollowersCount(followersCount + 1)
    }
    setSuivi(!suivi)
  }

  return (
    <div
      onClick={() => navigate(`/boutique/${boutique.id}`)}
      className="bg-white rounded-2xl shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1 duration-200"
    >
      {/* Image boutique */}
      <div className="h-36 sm:h-40 bg-green-50 flex items-center justify-center overflow-hidden">
        {boutique.logo_url ? (
          <img
            src={boutique.logo_url}
            alt={boutique.nom}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl">🏪</span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-800 text-base sm:text-lg line-clamp-1">
          {boutique.nom}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2">
          {boutique.description || 'Aucune description'}
        </p>

        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-400">
            👥 {followersCount} followers
          </span>
          <button
            onClick={toggleSuivi}
            className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
              suivi
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {suivi ? 'Suivi ✓' : '+ Suivre'}
          </button>
        </div>
      </div>
    </div>
  )
}
