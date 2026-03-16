import { useEffect } from 'react'

export default function ImageViewer({ image, nom, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  const telecharger = async () => {
    const response = await fetch(image)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${nom}.jpg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 z-10">
        <p className="text-white font-semibold text-sm truncate flex-1">{nom}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); telecharger() }}
            className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30 transition"
          >
            Télécharger
          </button>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-opacity-30 transition text-lg"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt={nom}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  )
}
