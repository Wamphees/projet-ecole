// components/HeroSection.jsx
import React from 'react';
import { Star, Shield, Clock, Users } from 'lucide-react';

function HeroSection(){
  return (
    <section className="bg-linear-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Texte principal */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Votre santé, 
              <span className="block text-yellow-300">notre priorité</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Prenez rendez-vous en ligne avec les meilleurs professionnels de santé. 
              Simple, rapide et sécurisé.
            </p>
            
            {/* Statistiques impressionnantes */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-300 mr-3" />
                <div>
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-blue-200">Professionnels</div>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-300 mr-3" />
                <div>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-sm text-blue-200">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex space-x-4">
              <button className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
                Prendre un RDV
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition">
                Être rappelé
              </button>
            </div>
          </div>

          {/* Formulaire de recherche rapide */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Trouvez un professionnel
            </h3>
            <div className="space-y-4">
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Spécialité médicale</option>
                <option>Généraliste</option>
                <option>Dentiste</option>
                <option>Dermatologue</option>
                <option>Ophtalmologue</option>
              </select>
              
              <input 
                type="text" 
                placeholder="Ville ou code postal"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Prochain créneau</option>
                  <option>Aujourd'hui</option>
                  <option>Cette semaine</option>
                </select>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;