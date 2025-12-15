// components/HeroSection.jsx
import React from 'react';
import { Star, Shield, Clock, Users } from 'lucide-react';
import { Link, useNavigate } from "react-router";
import medecinBackground from 'public/medecinBackground.png';

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
              <Link to="/search" className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">Rendez-vous!</Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition">
                Être rappelé
              </button>
            </div>
          </div>

          {/* image de la home page*/}
          <div className="bg-transparent relative top-16 h-">
            
          <img src={medecinBackground} width={1500} height={1500} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;