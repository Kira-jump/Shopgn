import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ADMIN_ID = 'c5e64ad8-b221-4a4c-a6b8-f1571353c126'

export default function Admin() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [corbeille, setCorbeille] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('utilisateurs')
  const [recherche, setRecherche] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    if (user.id !== ADMIN_ID) { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    const { data: users } = await supabase
      .from('profiles')
      .select(`
        *,
        boutiques (
          id, nom, whatsapp, followers_count,
          produits (id)
        )
      `)
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
    // Sauvegarder dans corbeille
    await supabase.from('corbeille').insert({
      user_id: u.id,
      nom: u.nom,
      email: u.email || '',
      role: u.role,
      whatsapp: u.boutiques?.[0]?.whatsapp || '',
      donnees: u
    })

    // Supprimer le profil
    await supabase.from('profiles').delete().eq('id', u.id)
    fetchData()
  }

  const restaurerUser = async (item) => {
    // Restaurer le profil
    await supabase.from('profiles').insert({
      id: item.user_id,
      nom: item.nom,
      role: item.role,
      bloque: false
    })

    // Supprimer de la corbeille
    await supabase.from('corbeille').delete().eq('id', item.id)
    fetchData()
  }

  const supprimerDefinitivement = async (id) => {
    await supabase.from('corbeille').delete().eq('id', id)
    fetchData()
  }

  // Stats inscriptions par jour
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
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <p>Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Panel Admin</h1>
            <p className="text-gray-400 text-sm mt-1">ShopGN — Gestion des utilisateurs</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">{utilisateurs.length}</p>
            <p className="text-gray-400 text-xs">utilisateurs total</p>
          </div>
        </div>
      </div>

      {/* Stats inscriptions */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-bold text-gray-700 mb-3">Inscriptions par jour</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Object.entries(statsParJour).slice(0, 7).map(([date, count]) => (
              <div key={date} className="flex-shrink-0 bg-green-50 rounded-xl p-3 text-center min-w-20">
                <p className="text-xl font-bold text-green-600">{count}</p>
                <p className="text-xs text-gray-400 mt-1">{date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {utilisateurs.filter(u => u.role === 'acheteur').length}
            </p>
            <p className="text-xs text-gray-400">Acheteurs</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-orange-500">
              {utilisateurs.filter(u => u.role === 'vendeur').length}
            </p>
            <p className="text-xs text-gray-400">Vendeurs</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-red-500">
              {utilisateurs.filter(u => u.bloque).length}
            </p>
            <p className="text-xs text-gray-400">Bloqués</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex">
          <button
            onClick={() => setOnglet('utilisateurs')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'utilisateurs' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'
            }`}
          >
            Utilisateurs ({utilisateurs.length})
          </button>
          <button
            onClick={() => setOnglet('corbeille')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              onglet === 'corbeille' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'
            }`}
          >
            Corbeille ({corbeille.length})
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {onglet === 'utilisateurs' && (
          <>
            {/* Recherche */}
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="space-y-3">
              {usersFiltres.map(u => (
                <div
                  key={u.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition ${
                    u.bloque ? 'border-red-200 bg-red-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{u.nom}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          u.role === 'vendeur'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {u.role}
                        </span>
                        {u.bloque && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                            Bloqué
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-1">
                        Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </p>

                      {u.boutiques && u.boutiques.length > 0 && (
                        <div className="mt-2 bg-gray-50 rounded-lg p-2">
                          <p className="text-xs font-semibold text-gray-600">{u.boutiques[0].nom}</p>
                          <p className="text-xs text-gray-400">
                            {u.boutiques[0].produits?.length || 0} produits •
                            {u.boutiques[0].followers_count} followers •
                            WhatsApp: {u.boutiques[0].whatsapp || 'Non renseigné'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => bloquerUser(u.id, u.bloque)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                          u.bloque
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        }`}
                      >
                        {u.bloque ? 'Débloquer' : 'Bloquer'}
                      </button>
                      <button
                        onClick={() => supprimerUser(u)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition"
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
              <div className="text-center py-16 text-gray-400">
                <p>Corbeille vide</p>
              </div>
            ) : (
              corbeille.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{item.nom}</p>
                      <p className="text-xs text-gray-400">{item.role}</p>
                      {item.whatsapp && (
                        <p className="text-xs text-gray-400">WhatsApp: {item.whatsapp}</p>
                      )}
                      <p className="text-xs text-red-400 mt-1">
                        Supprimé le {new Date(item.supprime_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => restaurerUser(item)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-green-100 text-green-600 hover:bg-green-200 transition"
                      >
                        Restaurer
                      </button>
                      <button
                        onClick={() => supprimerDefinitivement(item.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition"
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
  )
}
