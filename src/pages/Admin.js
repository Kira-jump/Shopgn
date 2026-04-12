import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [corbeille, setCorbeille] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('utilisateurs')
  const [recherche, setRecherche] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('admin_auth')) {
      navigate('/admin-login')
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: users } = await supabase
      .from('profiles')
      .select('*, boutiques(id, nom, whatsapp, followers_count, produits(id))')
      .order('created_at', { ascending: false })
    setUtilisateurs(users || [])

    const { data: corbeilleData } = await supabase
      .from('corbeille')
      .select('*')
      .order('supprime_at', { ascending: false })
    setCorbeille(corbeilleData || [])
    setLoading(false)
  }

  const bloquerUser = async (userId, bloque) => {
    await supabase
      .from('profiles')
      .update({ bloque: !bloque, bloque_at: !bloque ? new Date().toISOString() : null })
      .eq('id', userId)
    fetchData()
  }

  const supprimerUser = async (u) => {
    await supabase.from('corbeille').insert({
      user_id: u.id,
      nom: u.nom,
      email: '',
      role: u.role,
      whatsapp: u.boutiques?.[0]?.whatsapp || '',
      donnees: u
    })
    await supabase.from('profiles').delete().eq('id', u.id)
    fetchData()
  }

  const restaurerUser = async (item) => {
    await supabase.from('profiles').insert({
      id: item.user_id,
      nom: item.nom,
      role: item.role,
      bloque: false
    })
    await supabase.from('corbeille').delete().eq('id', item.id)
    fetchData()
  }

  const supprimerDefinitivement = async (id) => {
    await supabase.from('corbeille').delete().eq('id', id)
    fetchData()
  }

  const deconnexion = () => {
    localStorage.removeItem('admin_auth')
    navigate('/admin-login')
  }

  const statsParJour = utilisateurs.reduce((acc, u) => {
    const date = new Date(u.created_at).toLocaleDateString('fr-FR')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const usersFiltres = utilisateurs.filter(u =>
    u.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    u.role?.toLowerCase().includes(recherche.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
      <p>Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Panel Admin</h1>
            <p className="text-gray-400 text-xs mt-0.5">ShopGN</p>
          </div>
          <button
            onClick={deconnexion}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-green-400">{utilisateurs.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-blue-400">
              {utilisateurs.filter(u => u.role === 'acheteur').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Acheteurs</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-orange-400">
              {utilisateurs.filter(u => u.role === 'vendeur').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Vendeurs</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-red-400">
              {utilisateurs.filter(u => u.bloque).length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Bloqués</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <h2 className="font-bold text-white mb-3">Inscriptions par jour</h2>
          {Object.keys(statsParJour).length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune inscription</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Object.entries(statsParJour).map(([date, count]) => (
                <div key={date} className="flex-shrink-0 bg-gray-700 rounded-xl p-3 text-center min-w-20">
                  <p className="text-xl font-bold text-green-400">{count}</p>
                  <p className="text-xs text-gray-400 mt-1">{date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setOnglet('utilisateurs')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                onglet === 'utilisateurs' ? 'bg-gray-700 text-green-400' : 'text-gray-400'
              }`}
            >
              Utilisateurs ({utilisateurs.length})
            </button>
            <button
              onClick={() => setOnglet('corbeille')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                onglet === 'corbeille' ? 'bg-gray-700 text-red-400' : 'text-gray-400'
              }`}
            >
              Corbeille ({corbeille.length})
            </button>
          </div>

          <div className="p-4">
            {onglet === 'utilisateurs' && (
              <>
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="space-y-3">
                  {usersFiltres.map(u => (
                    <div
                      key={u.id}
                      className={`rounded-xl p-4 border ${
                        u.bloque ? 'bg-red-900/20 border-red-700' : 'bg-gray-700 border-gray-600'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-white">{u.nom}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              u.role === 'vendeur'
                                ? 'bg-orange-900 text-orange-300'
                                : 'bg-blue-900 text-blue-300'
                            }`}>
                              {u.role}
                            </span>
                            {u.bloque && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-900 text-red-300 font-semibold">
                                Bloqué
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          {u.boutiques && u.boutiques.length > 0 && (
                            <div className="mt-2 bg-gray-600 rounded-lg p-2">
                              <p className="text-xs font-semibold text-gray-200">{u.boutiques[0].nom}</p>
                              <p className="text-xs text-gray-400">
                                {u.boutiques[0].produits?.length || 0} produits •
                                {u.boutiques[0].followers_count} followers •
                                WA: {u.boutiques[0].whatsapp || 'Non renseigné'}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => bloquerUser(u.id, u.bloque)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                              u.bloque
                                ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                : 'bg-orange-900 text-orange-300 hover:bg-orange-800'
                            }`}
                          >
                            {u.bloque ? 'Débloquer' : 'Bloquer'}
                          </button>
                          <button
                            onClick={() => supprimerUser(u)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-900 text-red-300 hover:bg-red-800 transition"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {onglet === 'corbeille' && (
              <div className="space-y-3">
                {corbeille.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Corbeille vide</p>
                ) : (
                  corbeille.map(item => (
                    <div key={item.id} className="bg-gray-700 rounded-xl p-4 border border-red-800">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-white">{item.nom}</p>
                          <p className="text-xs text-gray-400">{item.role}</p>
                          {item.whatsapp && (
                            <p className="text-xs text-gray-400">WA: {item.whatsapp}</p>
                          )}
                          <p className="text-xs text-red-400 mt-1">
                            Supprimé le {new Date(item.supprime_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => restaurerUser(item)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-green-900 text-green-300 hover:bg-green-800 transition"
                          >
                            Restaurer
                          </button>
                          <button
                            onClick={() => supprimerDefinitivement(item.id)}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-900 text-red-300 hover:bg-red-800 transition"
                          >
                            Supprimer définitivement
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
