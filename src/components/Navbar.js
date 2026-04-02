import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile } = useAuth()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [notifsNonLues, setNotifsNonLues] = useState(0)

  useEffect(() => {
    if (user) fetchNotifsNonLues()
  }, [user])

  const fetchNotifsNonLues = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('lu', false)
    setNotifsNonLues(count || 0)
  }

  const deconnexion = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const badgeRole = profile?.role === 'vendeur'
    ? <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-semibold">Vendeur</span>
    : <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-semibold">Acheteur</span>

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm text-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-green-600 tracking-tight">
          ShopGN
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex gap-4 items-center text-sm">
          {user ? (
            <>
              <Link to="/" className="text-gray-600 hover:text-green-600 transition">Accueil</Link>
              {profile?.role === 'acheteur' && (
                <Link to="/feed" className="text-gray-600 hover:text-green-600 transition">Feed</Link>
              )}
              {profile?.role === 'vendeur' && (
                <>
                  <Link to="/creer-boutique" className="text-gray-600 hover:text-green-600 transition">Ma Boutique</Link>
                  <Link to="/dashboard" className="text-gray-600 hover:text-green-600 transition">Dashboard</Link>
                </>
              )}
              <Link to="/notifications" className="relative text-gray-600 hover:text-green-600 transition">
                🔔
                {notifsNonLues > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {notifsNonLues}
                  </span>
                )}
              </Link>
              <Link to="/profil" className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-green-50 transition">
                <span className="text-gray-700 font-medium">{profile?.nom}</span>
                {badgeRole}
              </Link>
              <button
                onClick={deconnexion}
                className="bg-green-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-green-700 transition text-sm"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="text-gray-600 hover:text-green-600 transition">Connexion</Link>
              <Link to="/inscription" className="bg-green-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-green-700 transition">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Burger mobile */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <Link to="/notifications" className="relative text-gray-600">
              🔔
              {notifsNonLues > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {notifsNonLues}
                </span>
              )}
            </Link>
          )}
          <button
            className="text-gray-700 text-2xl focus:outline-none"
            onClick={() => setMenuOuvert(!menuOuvert)}
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 flex flex-col gap-3 text-sm shadow-lg">
          {user ? (
            <>
              <div className="flex items-center gap-2 pt-3 pb-2 border-b border-gray-100">
                <span className="text-gray-800 font-semibold">{profile?.nom}</span>
                {badgeRole}
              </div>
              <Link to="/" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1">Accueil</Link>
              {profile?.role === 'acheteur' && (
                <Link to="/feed" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1">Feed</Link>
              )}
              {profile?.role === 'vendeur' && (
                <>
                  <Link to="/creer-boutique" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1">Ma Boutique</Link>
                  <Link to="/dashboard" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1">Dashboard</Link>
                </>
              )}
              <Link to="/notifications" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1">
                Notifications {notifsNonLues > 0 && `(${notifsNonLues})`}
              </Link>
              <Link to="/profil" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1">Mon Profil</Link>
              <button
                onClick={deconnexion}
                className="bg-green-600 text-white px-3 py-2 rounded-full font-semibold hover:bg-green-700 w-full mt-2"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setMenuOuvert(false)} className="text-gray-600 hover:text-green-600 py-1 pt-3">Connexion</Link>
              <Link to="/inscription" onClick={() => setMenuOuvert(false)} className="bg-green-600 text-white px-3 py-2 rounded-full font-semibold text-center hover:bg-green-700">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
