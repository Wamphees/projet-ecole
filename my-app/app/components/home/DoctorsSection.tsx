// src/components/DoctorsSection.js
import React, { useState, useEffect } from 'react';

const doctors = [
  {
    id: 1,
    name: "Dr. Jean Kamga",
    specialty: "Cardiologue",
    hospital: "Hôpital Général de Douala",
    image: "https://images.unsplash.com/photo-1672655412906-8e10ba6ee373?q=80&w=786&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    message: "Votre santé cardiaque est ma priorité. Consultations et suivi personnalisé.",
    experience: "15 ans",
    city: "Douala"
  },
  {
    id: 2,
    name: "Dr. Marie Ndongo",
    specialty: "Pédiatre",
    hospital: "Hôpital Laquintinie",
    image: "https://plus.unsplash.com/premium_photo-1661690013376-9c1b73f0b16c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    message: "Spécialiste de la santé infantile. Je accompagne vos enfants vers une croissance saine.",
    experience: "12 ans",
    city: "Douala"
  },
  {
    id: 3,
    name: "Dr. Paul Biya'achou",
    specialty: "Chirurgien Orthopédiste",
    hospital: "CME Yaoundé",
    image: "https://plus.unsplash.com/premium_photo-1682130171029-49261a5ba80a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    message: "Expert en chirurgie osseuse et articulaire. Rétablissons votre mobilité ensemble.",
    experience: "20 ans",
    city: "Yaoundé"
  },
  {
    id: 4,
    name: "Dr. Amina Bello",
    specialty: "Gynécologue-Obstétricienne",
    hospital: "Clinique des Femmes",
    image: "https://images.unsplash.com/photo-1678695972687-033fa0bdbac9?q=80&w=420&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    message: "Accompagnement complet de la femme à chaque étape de sa vie.",
    experience: "18 ans",
    city: "Garoua"
  }
];

const DoctorsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Défilement automatique
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === doctors.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change toutes les 4 secondes

    return () => clearInterval(interval);
  }, [isPaused, doctors.length]);

  const currentDoctor = doctors[currentIndex];

  return (
    <section className="py-20 bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nos Médecins Partenaires
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos {doctors.length} médecins camerounais experts, dévoués à votre santé 
            dans toutes les régions du pays
          </p>
        </div>

        {/* Carte du médecin avec animation */}
        <div 
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto transform transition-all duration-500 hover:shadow-3xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo du médecin */}
            <div className="shrink-0">
              <div className="relative">
                <img
                  src={currentDoctor.image}
                  alt={currentDoctor.name}
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {currentDoctor.experience}
                </div>
              </div>
            </div>

            {/* Informations du médecin */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentDoctor.name}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentDoctor.specialty}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentDoctor.city}
                  </span>
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  {currentDoctor.hospital}
                </p>
              </div>

              {/* Message du médecin */}
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-6">
                <p className="text-gray-700 text-lg italic">
                  "{currentDoctor.message}"
                </p>
              </blockquote>

              {/* Bouton prise de RDV */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform">
                  Prendre Rendez-vous
                </button>
                <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Voir le Profil Complet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateurs de progression */}
        <div className="flex justify-center items-center space-x-3 mt-12">
          {doctors.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 5000);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Compteur et navigation */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center space-x-4 text-gray-600">
            <span className="text-sm">
              Médecin {currentIndex + 1} sur {doctors.length}
            </span>
            <span className="text-blue-600 font-semibold">
              {currentDoctor.name}
            </span>
          </div>
        </div>

        {/* Section témoignages en mini-cartes */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Ils nous font confiance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.slice(0, 3).map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-2 border-blue-200"
                />
                <h4 className="font-semibold text-gray-900 mb-2">{doctor.name}</h4>
                <p className="text-sm text-blue-600 mb-2">{doctor.specialty}</p>
                <p className="text-xs text-gray-500">{doctor.hospital}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;