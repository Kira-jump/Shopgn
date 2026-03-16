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
    : <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-semibold">Acheteur</span>

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wide">
          ShopGN
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex gap-4 items-center text-sm">
          {user ? (
            <>
              <Link to="/" className="hover:underline">Accueil</Link>
              {profile?.role === 'acheteur' && (
                <Link to="/feed" className="hover:underline">Feed</Link>
              )}
              {profile?.role === 'vendeur' && (
                <>
                  <Link to="/creer-boutique" className="hover:underline">Ma Boutique</Link>
                  <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                </>
              )}
              {/* Cloche notifications */}
              <Link to="/notifications" className="relative hover:opacity-80">
                🔔
                {notifsNonLues > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {notifsNonLues}
                  </span>
                )}
              </Link>
              <Link to="/profil" className="flex items-center gap-2 bg-green-700 px-3 py-1.5 rounded-full hover:bg-green-800 transition">
                <span className="text-green-100 font-medium">{profile?.nom}</span>
                {badgeRole}
              </Link>
              <button
                onClick={deconnexion}
                className="bg-white text-green-600 px-3 py-1 rounded-full font-semibold hover:bg-green-100"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="hover:underline">Connexion</Link>
              <Link to="/inscription" className="bg-white text-green-600 px-3 py-1 rounded-full font-semibold hover:bg-green-100">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Burger mobile */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <Link to="/notifications" className="relative">
              🔔
              {notifsNonLues > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {notifsNonLues}
                </span>
              )}
            </Link>
          )}
          <button
            className="text-white text-2xl focus:outline-none"
            onClick={() => setMenuOuvert(!menuOuvert)}
          >
            {menuOuvert ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden bg-green-700 px-4 pb-4 flex flex-col gap-3 text-sm">
          {user ? (
            <>
              <Link to="/profil" onClick={() => setMenuOuvert(false)} className="flex items-center gap-2 pt-3">
                <span className="text-green-100 font-medium">{profile?.nom}</span>
                {badgeRole}
              </Link>
              <Link to="/" onClick={() => setMenuOuvert(false)} className="hover:underline">Accueil</Link>
              {profile?.role === 'acheteur' && (
                <Link to="/feed" onClick={() => setMenuOuvert(false)} className="hover:underline">Feed</Link>
              )}
              {profile?.role === 'vendeur' && (
                <>
                  <Link to="/creer-boutique" onClick={() => setMenuOuvert(false)} className="hover:underline">Ma Boutique</Link>
                  <Link to="/dashboard" onClick={() => setMenuOuvert(false)} className="hover:underline">Dashboard</Link>
                </>
              )}
              <Link to="/notifications" onClick={() => setMenuOuvert(false)} className="hover:underline">
                Notifications {notifsNonLues > 0 && `(${notifsNonLues})`}
              </Link>
              <Link to="/profil" onClick={() => setMenuOuvert(false)} className="hover:underline">Mon Profil</Link>
              <button
                onClick={deconnexion}
                className="bg-white text-green-600 px-3 py-2 rounded-full font-semibold hover:bg-green-100 w-full"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={() => setMenuOuvert(false)} className="hover:underline pt-2">Connexion</Link>
              <Link to="/inscription" onClick={() => setMenuOuvert(false)} className="bg-white text-green-600 px-3 py-2 rounded-full font-semibold text-center hover:bg-green-100">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
