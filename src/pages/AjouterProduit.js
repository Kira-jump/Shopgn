import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'

export default function AjouterProduit() {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prix, setPrix] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)
  const { boutiqueId } = useParams()
  const navigate = useNavigate()

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
    setSucces(false)

    let image_url = null

    if (image) {
      const ext = image.name.split('.').pop()
      const fileName = `produits/${boutiqueId}-${Date.now()}.${ext}`
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

    const { error } = await supabase.from('produits').insert({
      boutique_id: boutiqueId,
      nom,
      description,
      prix: parseFloat(prix),
      image_url,
    })

    if (error) {
      setErreur(`Erreur: ${error.message}`)
    } else {
      setSucces(true)
      setNom('')
      setDescription('')
      setPrix('')
      setImage(null)
      setPreview(null)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
          📦 Ajouter un produit
        </h1>
        <p className="text-gray-500 text-sm mb-6">Ajoute un produit à ta boutique</p>

        {erreur && (
          <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{erreur}</p>
        )}
        {succes && (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm flex justify-between items-center">
            <span>✅ Produit ajouté avec succès !</span>
            <button
              onClick={() => navigate(`/boutique/${boutiqueId}`)}
              className="underline text-green-700 font-medium"
            >
              Voir la boutique
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-44 sm:h-52 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200">
              {preview ? (
                <img src={preview} alt="produit" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center text-gray-400">
                  <p className="text-4xl mb-2">📷</p>
                  <p className="text-sm">Photo du produit</p>
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-green-50 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition">
              📱 Choisir depuis ton téléphone
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Robe wax taille M"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris ton produit..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (GNF)</label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              placeholder="Ex: 150000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Ajout en cours...' : '+ Ajouter le produit'}
          </button>
        </form>

        <button
          onClick={() => navigate(`/boutique/${boutiqueId}`)}
          className="w-full mt-3 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-sm sm:text-base"
        >
          ← Voir ma boutique
        </button>
      </div>
    </div>
  )
}
