import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

export default function Inscription() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [role, setRole] = useState('acheteur')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const navigate = useNavigate()

  const handleInscription = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password: motDePasse,
    })

    if (error) {
      setErreur(error.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        nom,
        role,
      })
    }

    setLoading(false)

    if (role === 'vendeur') {
      navigate('/creer-boutique')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-600 mb-2">🛍️ GuinéeShop</h1>
        <p className="text-center text-gray-500 mb-6">Crée ton compte</p>

        {erreur && <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{erreur}</p>}

        <form onSubmit={handleInscription} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ton nom</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Mamadou Diallo"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@gmail.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tu veux :</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('acheteur')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  role === 'acheteur'
                    ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                🛒 Acheter
              </button>
              <button
                type="button"
                onClick={() => setRole('vendeur')}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  role === 'vendeur'
                    ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                🏪 Vendre
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Création...' : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link to="/connexion" className="text-green-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
