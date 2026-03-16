import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../lib/categories'

export default function ModifierProduit() {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [categorie, setCategorie] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [imageActuelle, setImageActuelle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const { produitId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduit()
  }, [])

  const fetchProduit = async () => {
    const { data } = await supabase
      .from('produits')
      .select('*')
      .eq('id', produitId)
      .single()
    if (data) {
      setNom(data.nom)
      setDescription(data.description || '')
      setPrix(data.prix)
      setCategorie(data.categorie || '')
      setImageActuelle(data.image_url)
    }
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')

    let image_url = imageActuelle

    if (image) {
      const ext = image.name.split('.').pop()
      const fileName = `produits/${produitId}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, image)

      if (uploadError) {
        setErreur(`Erreur upload: ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase
      .from('produits')
      .update({ nom, description, prix: parseFloat(prix), categorie, image_url })
      .eq('id', produitId)

    if (error) {
      setErreur(`Erreur: ${error.message}`)
    } else {
      navigate(-1)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
          Modifier le produit
        </h1>
        <p className="text-gray-500 text-sm mb-6">Mets à jour les infos du produit</p>

        {erreur && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{erreur}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-44 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
              {preview || imageActuelle ? (
                <img
                  src={preview || imageActuelle}
                  alt={nom}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <p className="text-gray-400 text-sm">Photo du produit</p>
              )}
            </div>
            <label className="cursor-pointer bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition">
              Changer la photo
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de produit</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.filter(c => c.id !== 'tout').map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategorie(cat.id)}
                  className={`p-2 rounded-xl border-2 text-center transition-all text-xs relative ${
                    categorie === cat.id
                      ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                      : 'border-gray-200 text-gray-500 hover:border-green-200'
                  }`}
                >
                  {categorie === cat.id && (
                    <span className="absolute top-1 right-1 text-green-500 text-xs">✓</span>
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (GNF)</label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </form>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-3 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
