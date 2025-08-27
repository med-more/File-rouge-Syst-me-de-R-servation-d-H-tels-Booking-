"use client"

import { useEffect, useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, MapPin, Star, Trash2 } from "lucide-react"
import HotelIllustration from "../data/Hotel.svg"

const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorites")
      const parsed = stored ? JSON.parse(stored) : []
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const defaults = [
          {
            id: "h1",
            name: "Royal Vista Hotel",
            image: HotelIllustration,
            location: "Paris, France",
            pricePerNight: 149,
            rating: 4.7,
          },
          {
            id: "h2",
            name: "Ocean Breeze Resort",
            image: HotelIllustration,
            location: "Nice, Côte d'Azur",
            pricePerNight: 189,
            rating: 4.6,
          },
          {
            id: "h3",
            name: "Alpine Grand Lodge",
            image: HotelIllustration,
            location: "Chamonix, Mont-Blanc",
            pricePerNight: 129,
            rating: 4.8,
          },
        ]
        localStorage.setItem("favorites", JSON.stringify(defaults))
        setFavorites(defaults)
      } else {
        setFavorites(parsed)
      }
    } catch (e) {
      setFavorites([])
    }
  }, [])

  const hasFavorites = useMemo(() => favorites && favorites.length > 0, [favorites])

  const removeFavorite = (id) => {
    const next = favorites.filter((h) => h.id !== id)
    setFavorites(next)
    localStorage.setItem("favorites", JSON.stringify(next))
  }

  return (
    <div className="min-h-screen pt-28 pb-16 relative overflow-hidden bg-gray-50">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-extrabold text-black drop-shadow">Mes Favoris</h1>
          <p className="text-blue-700/80 mt-2">Retrouvez vos hôtels enregistrés</p>
        </div>

        {!hasFavorites ? (
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-blue-200/40 p-8 text-center animate-fade-in-up">
            <Heart className="w-10 h-10 mx-auto text-blue-500 mb-3" />
            <h2 className="text-xl font-semibold text-gray-900">Aucun favori pour le moment</h2>
            <p className="text-gray-600 mt-1">Ajoutez des hôtels à vos favoris pour les retrouver plus tard.</p>
            <button
              onClick={() => navigate('/hotels')}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-700 hover:to-blue-600 transition"
            >
              Parcourir les hôtels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((hotel) => (
              <div key={hotel.id} className="group bg-white rounded-2xl shadow-xl border border-blue-200/40 overflow-hidden animate-fade-in-up">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={hotel.image || HotelIllustration}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = HotelIllustration }}
                  />
                  <button
                    title="Retirer des favoris"
                    onClick={() => removeFavorite(hotel.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow hover:bg-white"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{hotel.name}</h3>
                    <div className="flex items-center text-yellow-500 ml-2">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-semibold ml-1">{hotel.rating || "4.5"}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm line-clamp-1">{hotel.location || "—"}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {hotel.pricePerNight ? (
                        <p className="text-gray-900 font-semibold">{hotel.pricePerNight} € <span className="text-sm text-gray-500">/ nuit</span></p>
                      ) : (
                        <p className="text-gray-500 text-sm">Prix non disponible</p>
                      )}
                    </div>
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites

