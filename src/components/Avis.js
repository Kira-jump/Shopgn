import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function Etoiles({ note, onClick, interactive = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onClick && onClick(i)}
          className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            i <= note ? 'text-yellow-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function Avis({ boutiqueId, vendeurId }) {
  const [avis, setAvis] = useState([])
  const [monAvis, setMonAvis] = useState(null)
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const { user, profile } = useAuth()

  useEffect(() => {
    fetchAvis()
  }, [boutiqueId])

  const fetchAvis = async () => {
    const { data } = await supabase
      .from('avis')
      .select('*, profiles(nom)')
      .eq('boutique_id', boutiqueId)
      .order('created_at', { ascending: false })
    setAvis(data || [])

    if (user) {
      const monAvisData = data?.find(a => a.acheteur_id === user.id)
      if (monAvisData) {
        setMonAvis(monAvisData)
        setNote(monAvisData.note)
        setCommentaire(monAvisData.commentaire || '')
      }
    }
  }

  const moyenneNote = avis.length > 0
    ? (avis.reduce((acc, a) => acc + a.note, 0) / avis.length).toFixed(1)
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (note === 0) return
    setLoading(true)

    if (monAvis) {
      await supabase.from('avis')
        .update({ note, commentaire })
        .eq('id', monAvis.id)
    } else {
      await supabase.from('avis').insert({
        boutique_id: boutiqueId,
        acheteur_id: user.id,
        note,
        commentaire
      })

      // Notifier le vendeur
      if (vendeurId && vendeurId !== user.id) {
        await supabase.from('notifications').insert({
          user_id: vendeurId,
          type: 'avis',
          message: `⭐ Tu as reçu un nouvel avis ${note}/5 ${commentaire ? `- "${commentaire.substring(0, 50)}..."` : ''}`,
          lien: `/boutique/${boutiqueId}`
        })
      }
    }

    await fetchAvis()
    setAfficherFormulaire(false)
    setLoading(false)
  }

  const handleSupprimer = async () => {
    if (!monAvis) return
    await supabase.from('avis').delete().eq('id', monAvis.id)
    setMonAvis(null)
    setNote(0)
    setCommentaire('')
    await fetchAvis()
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700">⭐ Avis ({avis.length})</h2>
        {avis.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-500">{moyenneNote}</span>
            <div>
              <Etoiles note={Math.round(moyenneNote)} />
              <p className="text-xs text-gray-400">{avis.length} avis</p>
            </div>
          </div>
        )}
      </div>

      {user && profile?.role === 'acheteur' && (
        <div className="mb-4">
          {!afficherFormulaire ? (
            <button
              onClick={() => setAfficherFormulaire(true)}
              className="w-full border-2 border-dashed border-green-200 text-green-600 py-3 rounded-xl text-sm font-medium hover:bg-green-50 transition"
            >
              {monAvis ? '✏️ Modifier mon avis' : '⭐ Laisser un avis'}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-green-50 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ta note</p>
                <Etoiles note={note} onClick={setNote} interactive={true} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Commentaire</p>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Partage ton expérience..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || note === 0}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : monAvis ? 'Mettre à jour' : 'Publier'}
                </button>
                <button
                  type="button"
                  onClick={() => setAfficherFormulaire(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                {monAvis && (
                  <button
                    type="button"
                    onClick={handleSupprimer}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {avis.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm">Aucun avis pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avis.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    👤 {a.profiles?.nom || 'Anonyme'}
                    {a.acheteur_id === user?.id && (
                      <span className="ml-2 text-xs text-green-600">(moi)</span>
                    )}
                  </p>
                  <Etoiles note={a.note} />
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {a.commentaire && (
                <p className="text-gray-600 text-sm mt-2">{a.commentaire}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
