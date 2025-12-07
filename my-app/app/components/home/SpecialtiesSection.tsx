// src/components/SpecialtiesSection.js
import React, { useState, useEffect, useRef } from 'react';

const specialties = [
  { name: 'Médecine Générale', icon: '🩺', doctors: '2,450+', color: 'blue' },
  { name: 'Dentiste', icon: '🦷', doctors: '1,200+', color: 'green' },
  { name: 'Dermatologie', icon: '🔍', doctors: '850+', color: 'purple' },
  { name: 'Ophtalmologie', icon: '👁️', doctors: '720+', color: 'red' },
  { name: 'Gynécologie', icon: '🌸', doctors: '680+', color: 'pink' },
  { name: 'Pédiatrie', icon: '👶', doctors: '540+', color: 'yellow' },
  { name: 'Cardiologie', icon: '❤️', doctors: '420+', color: 'red' },
  { name: 'Psychologie', icon: '🧠', doctors: '890+', color: 'indigo' },
  { name: 'ORL', icon: '👂', doctors: '380+', color: 'orange' },
  { name: 'Rhumatologie', icon: '🦴', doctors: '290+', color: 'teal' },
  { name: 'Gastro-entérologie', icon: '🍎', doctors: '510+', color: 'emerald' },
  { name: 'Neurologie', icon: '🧬', doctors: '330+', color: 'violet' },
  { name: 'Urologie', icon: '💧', doctors: '270+', color: 'blue' },
  { name: 'Chirurgie', icon: '🔪', doctors: '480+', color: 'red' },
  { name: 'Radiologie', icon: '📷', doctors: '310+', color: 'gray' },
  { name: 'Oncologie', icon: '🎗️', doctors: '220+', color: 'purple' },
];

export  function SpecialtiesSection(){
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);

  // Défilement automatique
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === specialties.length - 4 ? 0 : prevIndex + 1
      );
    }, 3000); // Change toutes les 3 secondes

    return () => clearInterval(interval);
  }, [isPaused]);

  // Fonction de glissement manuel
  function handleScroll(direction : any){
    if (direction === 'next') {
      setCurrentIndex(prev => 
        prev >= specialties.length - 4 ? 0 : prev + 1
      );
    } else {
      setCurrentIndex(prev => 
        prev <= 0 ? specialties.length - 4 : prev - 1
      );
    }
  };

  // Gestion du glissement tactile/souris
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e : any) => {
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleTouchMove = (e : any) => {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = startX - currentX;

    if (Math.abs(diff) > 50) { // Seuil de glissement
      if (diff > 0) {
        handleScroll('next');
      } else {
        handleScroll('prev');
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000); // Reprend le défilement auto après 2sec
  };

  const visibleSpecialties = specialties.slice(currentIndex, currentIndex + 4);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Toutes les spécialités médicales
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos {specialties.length} spécialités médicales et trouvez le professionnel qu'il vous faut
          </p>
        </div>

        {/* Conteneur principal avec navigation */}
        <div className="relative">
          {/* Bouton précédent */}
          <button 
            onClick={() => handleScroll('prev')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Grille des spécialités avec glissement */}
          <div 
            ref={scrollContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 cursor-grab active:cursor-grabbing"
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {visibleSpecialties.map((specialty, index) => (
              <div 
                key={currentIndex + index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {specialty.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {specialty.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {specialty.doctors} praticiens
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Voir les médecins</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton suivant */}
          <button 
            onClick={() => handleScroll('next')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicateurs de progression */}
        <div className="flex justify-center items-center space-x-3 mt-8">
          {Array.from({ length: Math.ceil(specialties.length / 4) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 4)}
              className={`w-3 h-3 rounded-full transition-all ${
                Math.floor(currentIndex / 4) === index 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Compteur */}
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">
            {currentIndex + 1}-{Math.min(currentIndex + 4, specialties.length)} sur {specialties.length} spécialités
          </span>
        </div>

        {/* Bouton voir toutes les spécialités */}
        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform">
            Voir toutes les spécialités
          </button>
        </div>
      </div>
    </section>
  )
};
