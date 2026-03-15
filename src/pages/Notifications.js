import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/connexion'); return }
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)

    // Marquer toutes comme lues
    await supabase
      .from('notifications')
      .update({ lu: true })
      .eq('user_id', user.id)
      .eq('lu', false)
  }

  const iconeType = (type) => {
    switch(type) {
      case 'follow': return '👥'
      case 'avis': return '⭐'
      case 'produit': return '📦'
      default: return '🔔'
    }
  }

  const supprimerTout = async () => {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
    setNotifications([])
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
      <div className="bg-green-600 text-white py-6 px-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">🔔 Notifications</h1>
            <p className="text-green-100 text-sm mt-1">
              {notifications.filter(n => !n.lu).length} non lue{notifications.filter(n => !n.lu).length > 1 ? 's' : ''}
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={supprimerTout}
              className="bg-green-700 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-800 transition"
            >
              🗑️ Tout supprimer
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔔</p>
            <p className="font-semibold text-gray-600">Aucune notification</p>
            <p className="text-sm mt-1">Tu seras notifié quand quelqu'un interagit avec ta boutique</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => notif.lien && navigate(notif.lien)}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition cursor-pointer hover:shadow-md ${
                  !notif.lu
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{iconeType(notif.type)}</span>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.lu ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notif.lu && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
