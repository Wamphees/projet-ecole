// src/components/Footer.js
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer(){
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold">Medismart</span>
          </div>
          <p className="text-gray-400 mb-4">
            La plateforme de référence pour la prise de rendez-vous médicaux en ligne.
          </p>
          <div className="flex justify-center space-x-4">
            <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <div className="text-gray-400 text-sm">
             Medismart. Tous droits réservés.
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Prendre soin de vous est notre priorite
          </div>
        </div>
      </div>
    </footer>
  );
};
