import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import CarteBoutique from '../components/CarteBoutique'

export default function Profil() {
  const [boutiquesFollowees, setBoutiquesFollowees] = useState([])
  const [maBoutique, setMaBoutique] = useState(null)
  const [mesAvis, setMesAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('infos')
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (profile?.role === 'acheteur') {
      const { data: follows } = await supabase
        .from('follows')
        .select('boutique_id')
        .eq('acheteur_id', user.id)

      if (follows && follows.length > 0) {
        const ids = follows.map(f => f.boutique_id)
        const { data } = await supabase
          .from('boutiques')
          .select('*')
          .in('id', ids)
        setBoutiquesFollowees(data || [])
      }

      const { data: avisData } = await supabase
        .from('avis')
        .select('*, boutiques(nom, logo_url)')
        .eq('acheteur_id', user.id)
        .order('created_at', { ascending: false })
      setMesAvis(avisData || [])
    }

    if (profile?.role === 'vendeur') {
      const { data } = await supabase
        .from('boutiques')
        .select('*')
        .eq('vendeur_id', user.id)
        .maybeSingle()
      setMaBoutique(data)
    }

    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <p>Chargement...</p>
    </div>
  )

  const photoProfile = profile?.role === 'vendeur' && maBoutique?.logo_url
    ? maBoutique.logo_url
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header profil */}
      <div className="bg-green-600 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg overflow-hidden">
            {photoProfile ? (
              <img src={photoProfile} alt={profile?.nom} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-200 flex items-center justify-center">
                <span className="text-green-600 font-bold text-2xl">
                  {profile?.nom?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{profile?.nom}</h1>
          <p className="text-green-100 text-sm mt-1">{user?.email}</p>
          <div className="mt-2">
            {profile?.role === 'vendeur'
              ? <span className="bg-orange-400 text-white text-xs px-3 py-1 rounded-full font-semibold">Vendeur</span>
              : <span className="bg-blue-400 text-white text-xs px-3 py-1 rounded-full font-semibold">Acheteur</span>
            }
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 grid grid-cols-3 gap-4 text-center">
          {profile?.role === 'acheteur' ? (
            <>
              <div>
                <p className="text-xl font-bold text-green-600">{boutiquesFollowees.length}</p>
                <p className="text-xs text-gray-400">Suivis</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{mesAvis.length}</p>
                <p className="text-xs text-gray-400">Avis</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">
                  {mesAvis.length > 0
                    ? (mesAvis.reduce((acc, a) => acc + a.note, 0) / mesAvis.length).toFixed(1)
                    : '-'}
                </p>
                <p className="text-xs text-gray-400">Note moy.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xl font-bold text-green-600">{maBoutique?.followers_count || 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{maBoutique ? 1 : 0}</p>
                <p className="text-xs text-gray-400">Boutique</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">
                  {new Date(user?.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400">Membre depuis</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow-sm sticky top-0 z-10 mt-1">
        <div className="max-w-2xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('infos')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'infos' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
            }`}
          >
            Infos
          </button>
          {profile?.role === 'acheteur' && (
            <>
              <button
                onClick={() => setOnglet('suivis')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                  onglet === 'suivis' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
                }`}
              >
                Boutiques suivies
              </button>
              <button
                onClick={() => setOnglet('avis')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                  onglet === 'avis' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
                }`}
              >
                Mes avis
              </button>
            </>
          )}
          {profile?.role === 'vendeur' && (
            <button
              onClick={() => setOnglet('boutique')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
                onglet === 'boutique' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
              }`}
            >
              Ma boutique
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Infos */}
        {onglet === 'infos' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Nom complet</p>
              <p className="font-semibold text-gray-800">{profile?.nom}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="font-semibold text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Rôle</p>
              <p className="font-semibold text-gray-800 capitalize">{profile?.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Membre depuis</p>
              <p className="font-semibold text-gray-800">
                {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>

            {profile?.role === 'vendeur' && maBoutique && (
              <button
                onClick={() => navigate(`/boutique/${maBoutique.id}`)}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Voir ma boutique
              </button>
            )}
            {profile?.role === 'vendeur' && !maBoutique && (
              <button
                onClick={() => navigate('/creer-boutique')}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
              >
                Créer ma boutique
              </button>
            )}
          </div>
        )}

        {/* Boutiques suivies */}
        {onglet === 'suivis' && (
          boutiquesFollowees.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Tu ne suis aucune boutique</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition text-sm"
              >
                Découvrir des boutiques
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {boutiquesFollowees.map(boutique => (
                <CarteBoutique key={boutique.id} boutique={boutique} userId={user?.id} />
              ))}
            </div>
          )
        )}

        {/* Mes avis */}
        {onglet === 'avis' && (
          mesAvis.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Tu n'as laissé aucun avis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mesAvis.map(a => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/boutique/${a.boutique_id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-50 overflow-hidden flex-shrink-0">
                      {a.boutiques?.logo_url ? (
                        <img src={a.boutiques.logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-green-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{a.boutiques?.nom}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={`text-sm ${i <= a.note ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {a.commentaire && (
                    <p className="text-gray-600 text-sm">{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Ma boutique vendeur */}
        {onglet === 'boutique' && (
          maBoutique ? (
            <CarteBoutique boutique={maBoutique} userId={user?.id} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>Tu n'as pas encore de boutique</p>
              <button
                onClick={() => navigate('/creer-boutique')}
                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition text-sm"
              >
                Créer ma boutique
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
