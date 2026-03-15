import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Accueil from './pages/Accueil'
import Inscription from './pages/Inscription'
import Connexion from './pages/Connexion'
import Boutique from './pages/Boutique'
import CreerBoutique from './pages/CreerBoutique'
import AjouterProduit from './pages/AjouterProduit'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/boutique/:id" element={<Boutique />} />
          <Route path="/creer-boutique" element={<CreerBoutique />} />
          <Route path="/ajouter-produit/:boutiqueId" element={<AjouterProduit />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
