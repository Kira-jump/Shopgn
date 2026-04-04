import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function CarteBoutique({ boutique, userId }) {
  const [suivi, setSuivi] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFollowers()
    if (userId) verifierSuivi()
  }, [userId, boutique.id])

  const fetchFollowers = async () => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('boutique_id', boutique.id)
    setFollowersCount(count || 0)
  }

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
      setSuivi(false)
      setFollowersCount(prev => prev - 1)
    } else {
      await supabase.from('follows')
        .insert({ acheteur_id: userId, boutique_id: boutique.id })
      setSuivi(true)
      setFollowersCount(prev => prev + 1)
    }
  }

  return (
    <div
      onClick={() => navigate(`/boutique/${boutique.id}`)}
      className="bg-white rounded-2xl shadow hover:shadow-md transition cursor-pointer overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1 duration-200"
    >
      <div className="h-36 sm:h-40 bg-green-50 flex items-center justify-center overflow-hidden">
        {boutique.logo_url ? (
          <img src={boutique.logo_url} alt={boutique.nom} className="h-full w-full object-cover" />
        ) : (
          <div className="w-full h-full bg-green-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Logo</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg">{boutique.nom}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{boutique.description}</p>

        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-400">
            {followersCount} followers
          </span>
          <button
            onClick={toggleSuivi}
            className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
              suivi
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {suivi ? 'Suivi' : '+ Suivre'}
          </button>
        </div>
      </div>
    </div>
  )
}
