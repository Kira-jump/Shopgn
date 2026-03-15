import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [boutique, setBoutique] = useState(null)
  const [stats, setStats] = useState({
    vues: 0, vuesAujourdhui: 0, vueSemaine: 0,
    followers: 0, produits: 0, avis: 0, moyenneNote: 0
  })
  const [vuesParJour, setVuesParJour] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    if (profile && profile.role !== 'vendeur') { navigate('/'); return }
    if (profile) fetchData()
  }, [user, profile])

  const fetchData = async () => {
    // Récupère la boutique
    const { data: boutiqueData } = await supabase
      .from('boutiques')
      .select('*')
      .eq('vendeur_id', user.id)
      .maybeSingle()

    if (!boutiqueData) { setLoading(false); return }
    setBoutique(boutiqueData)

    // Vues totales
    const { data: vuesData } = await supabase
      .from('vues')
      .select('created_at')
      .eq('boutique_id', boutiqueData.id)

    // Vues aujourd'hui
    const aujourd = new Date().toISOString().split('T')[0]
    const vuesAujourdhui = vuesData?.filter(v =>
      v.created_at.startsWith(aujourd)
    ).length || 0

    // Vues cette semaine
    const semaine = new Date()
    semaine.setDate(semaine.getDate() - 7)
    const vueSemaine = vuesData?.filter(v =>
      new Date(v.created_at) >= semaine
    ).length || 0

    // Vues par jour (7 derniers jours)
    const joursLabels = []
    const joursData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const label = date.toLocaleDateString('fr-FR', { weekday: 'short' })
      const count = vuesData?.filter(v => v.created_at.startsWith(dateStr)).length || 0
      joursLabels.push(label)
      joursData.push(count)
    }
    setVuesParJour(joursLabels.map((label, i) => ({ label, count: joursData[i] })))

    // Produits
    const { count: produitsCount } = await supabase
      .from('produits')
      .select('*', { count: 'exact', head: true })
      .eq('boutique_id', boutiqueData.id)

    // Avis
    const { data: avisData } = await supabase
      .from('avis')
      .select('note')
      .eq('boutique_id', boutiqueData.id)

    const moyenneNote = avisData?.length > 0
      ? (avisData.reduce((acc, a) => acc + a.note, 0) / avisData.length).toFixed(1)
      : 0

    setStats({
      vues: vuesData?.length || 0,
      vuesAujourdhui,
      vueSemaine,
      followers: boutiqueData.followers_count,
      produits: produitsCount || 0,
      avis: avisData?.length || 0,
      moyenneNote
    })

    setLoading(false)
  }

  const maxVues = Math.max(...vuesParJour.map(v => v.count), 1)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-4xl mb-3">⏳</p>
        <p>Chargement...</p>
      </div>
    </div>
  )

  if (!boutique) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">🏪</p>
        <p className="font-semibold text-gray-700 mb-2">Tu n'as pas encore de boutique</p>
        <button
          onClick={() => navigate('/creer-boutique')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          Créer ma boutique 🚀
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold">📊 Dashboard</h1>
          <p className="text-green-100 text-sm mt-1">{boutique.nom}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cartes stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-green-600">{stats.vues}</p>
            <p className="text-xs text-gray-400 mt-1">👁️ Vues totales</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-blue-500">{stats.vuesAujourdhui}</p>
            <p className="text-xs text-gray-400 mt-1">📅 Vues aujourd'hui</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-purple-500">{stats.vueSemaine}</p>
            <p className="text-xs text-gray-400 mt-1">📆 Vues cette semaine</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-orange-500">{stats.followers}</p>
            <p className="text-xs text-gray-400 mt-1">👥 Followers</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-pink-500">{stats.produits}</p>
            <p className="text-xs text-gray-400 mt-1">📦 Produits</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-3xl font-bold text-yellow-500">
              {stats.moyenneNote > 0 ? `${stats.moyenneNote}⭐` : '-'}
            </p>
            <p className="text-xs text-gray-400 mt-1">💬 {stats.avis} avis</p>
          </div>
        </div>

        {/* Graphique vues 7 jours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">📈 Vues des 7 derniers jours</h2>
          <div className="flex items-end gap-2 h-32">
            {vuesParJour.map((jour, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{jour.count}</span>
                <div
                  className="w-full bg-green-500 rounded-t-lg transition-all"
                  style={{
                    height: `${jour.count === 0 ? 4 : (jour.count / maxVues) * 100}px`,
                    opacity: jour.count === 0 ? 0.2 : 1
                  }}
                />
                <span className="text-xs text-gray-400">{jour.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">⚡ Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/ajouter-produit/${boutique.id}`)}
              className="bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition text-sm"
            >
              + Ajouter un produit
            </button>
            <button
              onClick={() => navigate(`/boutique/${boutique.id}`)}
              className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition text-sm"
            >
              👁️ Voir ma boutique
            </button>
            <button
              onClick={() => navigate('/creer-boutique')}
              className="bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-sm"
            >
              ✏️ Modifier boutique
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition text-sm"
            >
              🔔 Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
