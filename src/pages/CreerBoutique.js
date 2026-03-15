import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'

export default function CreerBoutique() {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [categories, setCategories] = useState([])
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [boutique, setBoutique] = useState(null)
  const [checkDone, setCheckDone] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchMaBoutique()
  }, [user])

  const fetchMaBoutique = async () => {
    const { data } = await supabase
      .from('boutiques')
      .select('*')
      .eq('vendeur_id', user.id)
      .maybeSingle()
    if (data) {
      setBoutique(data)
      setNom(data.nom)
      setDescription(data.description || '')
      setWhatsapp(data.whatsapp || '')
      setCategories(data.categories || [])
    }
    setCheckDone(true)
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const toggleCategorie = (id) => {
    if (categories.includes(id)) {
      setCategories(categories.filter(c => c !== id))
    } else {
      setCategories([...categories, id])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (categories.length === 0) {
      setErreur('Choisis au moins une catégorie')
      return
    }
    setLoading(true)
    setErreur('')

    let logo_url = boutique?.logo_url || null

    if (logo) {
      const ext = logo.name.split('.').pop()
      const fileName = `logos/${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, logo)

      if (uploadError) {
        setErreur(`Erreur upload: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)
      logo_url = urlData.publicUrl
    }

    if (boutique) {
      await supabase.from('boutiques')
        .update({ nom, description, whatsapp, logo_url, categories })
        .eq('id', boutique.id)
      setLoading(false)
      navigate(`/boutique/${boutique.id}`)
    } else {
      const { data, error } = await supabase.from('boutiques')
        .insert({ vendeur_id: user.id, nom, description, whatsapp, logo_url, categories })
        .select()
        .single()

      if (error) {
        setErreur(`Erreur: ${error.message}`)
        setLoading(false)
        return
      }

      setBoutique(data)
      setLoading(false)
      navigate(`/boutique/${data.id}`)
    }
  }

  if (!checkDone && user) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-4xl mb-3">⏳</p>
        <p>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
          {boutique ? '✏️ Modifier ma boutique' : '🏪 Créer ma boutique'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {boutique ? 'Mets à jour les infos de ta boutique' : 'Configure ta boutique en quelques secondes'}
        </p>

        {erreur && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{erreur}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center overflow-hidden border-2 border-green-200">
              {preview || boutique?.logo_url ? (
                <img src={preview || boutique?.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🏪</span>
              )}
            </div>
            <label className="cursor-pointer bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition">
              📷 Choisir un logo
              <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Mode Conakry"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              required
            />
          </div>

          {/* Catégories multiples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégories
              <span className="text-gray-400 font-normal ml-1">(choisis une ou plusieurs)</span>
            </label>
            {categories.length > 0 && (
              <p className="text-xs text-green-600 mb-2">
                ✅ {categories.length} catégorie{categories.length > 1 ? 's' : ''} sélectionnée{categories.length > 1 ? 's' : ''}
              </p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.filter(c => c.id !== 'tout').map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategorie(cat.id)}
                  className={`p-2 rounded-xl border-2 text-center transition-all text-xs relative ${
                    categories.includes(cat.id)
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-200 text-gray-500 hover:border-green-200'
                  }`}
                >
                  {categories.includes(cat.id) && (
                    <span className="absolute top-1 right-1 text-green-500 text-xs">✓</span>
                  )}
                  <div className="text-lg">{cat.emoji}</div>
                  <div>{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris ce que tu vends..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 224621000000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Format international sans + (224XXXXXXXXX)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Enregistrement...' : boutique ? 'Mettre à jour' : 'Créer ma boutique 🚀'}
          </button>
        </form>

        {boutique && (
          <button
            onClick={() => navigate(`/ajouter-produit/${boutique.id}`)}
            className="w-full mt-3 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition text-sm sm:text-base"
          >
            + Ajouter des produits
          </button>
        )}
      </div>
    </div>
  )
}
