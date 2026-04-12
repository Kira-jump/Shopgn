import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_USER = 'admin'
const ADMIN_PWD = 'shopgn2026'

export default function AdminLogin() {
  const [nom, setNom] = useState('')
  const [pwd, setPwd] = useState('')
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (nom === ADMIN_USER && pwd === ADMIN_PWD) {
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin')
    } else {
      setErreur('Identifiants incorrects')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-1">ShopGN</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Panel Administrateur</p>

        {erreur && (
          <p className="bg-red-900 text-red-300 p-3 rounded-lg mb-4 text-sm text-center">{erreur}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nom d'utilisateur</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="admin"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
