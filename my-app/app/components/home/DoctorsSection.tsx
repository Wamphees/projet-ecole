// src/components/DoctorsSection.js
import React, { useState, useEffect } from 'react';

const doctors = [
  {
    id: 1,
    name: "Dr. Jean Kamga",
    specialty: "Cardiologue",
    hospital: "Hôpital Général de Douala",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    message: "Votre santé cardiaque est ma priorité. Consultations et suivi personnalisé.",
    experience: "15 ans",
    city: "Douala"
  },
  {
    id: 2,
    name: "Dr. Marie Ndongo",
    specialty: "Pédiatre",
    hospital: "Hôpital Laquintinie",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    message: "Spécialiste de la santé infantile. Je accompagne vos enfants vers une croissance saine.",
    experience: "12 ans",
    city: "Douala"
  },
  {
    id: 3,
    name: "Dr. Paul Biya'achou",
    specialty: "Chirurgien Orthopédiste",
    hospital: "CME Yaoundé",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    message: "Expert en chirurgie osseuse et articulaire. Rétablissons votre mobilité ensemble.",
    experience: "20 ans",
    city: "Yaoundé"
  },
  {
    id: 4,
    name: "Dr. Amina Bello",
    specialty: "Gynécologue-Obstétricienne",
    hospital: "Clinique des Femmes",
    image: "https://images.unsplash.com/photo-1594824947933-d0501ba2fe65?w=200&h=200&fit=crop&crop=face",
    message: "Accompagnement complet de la femme à chaque étape de sa vie.",
    experience: "18 ans",
    city: "Garoua"
  },
  {
    id: 5,
    name: "Dr. Samuel Eto'o",
    specialty: "Médecine du Sport",
    hospital: "Centre Sport-Santé",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    message: "Optimisez vos performances sportives et prévenez les blessures.",
    experience: "10 ans",
    city: "Yaoundé"
  },
  {
    id: 6,
    name: "Dr. Chantal Mbarga",
    specialty: "Dermatologue",
    hospital: "Institut de Dermatologie",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    message: "Soins de la peau adaptés au climat camerounais. Solutions personnalisées.",
    experience: "14 ans",
    city: "Douala"
  },
  {
    id: 7,
    name: "Dr. Alain Sona",
    specialty: "Ophtalmologue",
    hospital: "Centre Vision Plus",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    message: "Préservez votre vue avec des consultations régulières et des soins adaptés.",
    experience: "16 ans",
    city: "Bafoussam"
  },
  {
    id: 8,
    name: "Dr. Fatou Ndiaye",
    specialty: "Pédopsychiatre",
    hospital: "Centre Médico-Psychologique",
    image: "https://images.unsplash.com/photo-1594824947933-d0501ba2fe65?w=200&h=200&fit=crop&crop=face",
    message: "Santé mentale des jeunes : écoute, compréhension et accompagnement.",
    experience: "11 ans",
    city: "Yaoundé"
  },
  {
    id: 9,
    name: "Dr. Roger Milla",
    specialty: "Gériatre",
    hospital: "Centre Senior Santé",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    message: "Bien vieillir au Cameroun : suivi personnalisé pour nos aînés.",
    experience: "22 ans",
    city: "Yaoundé"
  },
  {
    id: 10,
    name: "Dr. Nathalie Kotto",
    specialty: "Endocrinologue",
    hospital: "Hôpital Central",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    message: "Spécialiste du diabète et des troubles hormonaux. Suivi sur mesure.",
    experience: "13 ans",
    city: "Douala"
  },
  {
    id: 11,
    name: "Dr. Patrice Ngan",
    specialty: "Urologue",
    hospital: "Clinique Urologique",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    message: "Prévention et traitement des troubles urinaires avec expertise.",
    experience: "17 ans",
    city: "Douala"
  },
  {
    id: 12,
    name: "Dr. Sylvie Ngo",
    specialty: "Nutritionniste",
    hospital: "Centre Nutrition Santé",
    image: "https://images.unsplash.com/photo-1594824947933-d0501ba2fe65?w=200&h=200&fit=crop&crop=face",
    message: "Alimentation équilibrée adaptée à notre culture et produits locaux.",
    experience: "9 ans",
    city: "Yaoundé"
  },
  {
    id: 13,
    name: "Dr. Marc Owona",
    specialty: "Pneumologue",
    hospital: "Hôpital Pulmonaire",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    message: "Spécialiste des maladies respiratoires sous nos climats tropicaux.",
    experience: "15 ans",
    city: "Douala"
  },
  {
    id: 14,
    name: "Dr. Estelle Mballa",
    specialty: "Dentiste",
    hospital: "Cabinet Dental Smile",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    message: "Un sourire éclatant pour tous. Soins dentaires modernes et indolores.",
    experience: "8 ans",
    city: "Yaoundé"
  },
  {
    id: 15,
    name: "Dr. Christian Tumi",
    specialty: "Neurologue",
    hospital: "Institut Neurologique",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    message: "Expert en maladies neurologiques avec approche humaine et compréhensive.",
    experience: "19 ans",
    city: "Douala"
  },
  {
    id: 16,
    name: "Dr. Gisèle Nkodo",
    specialty: "Médecin Généraliste",
    hospital: "Centre Médical du Plateau",
    image: "https://images.unsplash.com/photo-1594824947933-d0501ba2fe65?w=200&h=200&fit=crop&crop=face",
    message: "Médecine de famille : suivi global de toute la famille depuis 15 ans.",
    experience: "15 ans",
    city: "Yaoundé"
  },
  {
    id: 17,
    name: "Dr. Armand Foe",
    specialty: "Chirurgien Viscéral",
    hospital: "Centre Chirurgical Moderne",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    message: "Chirurgie digestive de pointe avec des techniques mini-invasives.",
    experience: "21 ans",
    city: "Douala"
  },
  {
    id: 18,
    name: "Dr. Brigitte Ngo",
    specialty: "Oncologue",
    hospital: "Centre d'Oncologie",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    message: "Lutte contre le cancer avec compassion et traitements innovants.",
    experience: "16 ans",
    city: "Yaoundé"
  },
  {
    id: 19,
    name: "Dr. Eric Djemba",
    specialty: "Radiologue",
    hospital: "Centre d'Imagerie Médicale",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    message: "Diagnostic précis grâce aux technologies d'imagerie les plus récentes.",
    experience: "12 ans",
    city: "Douala"
  },
  {
    id: 20,
    name: "Dr. Laura Mbappe",
    specialty: "Médecine Esthétique",
    hospital: "Institut de Beauté Médicale",
    image: "https://images.unsplash.com/photo-1594824947933-d0501ba2fe65?w=200&h=200&fit=crop&crop=face",
    message: "Esthétique médicale sûre pour révéler votre beauté naturelle.",
    experience: "7 ans",
    city: "Douala"
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