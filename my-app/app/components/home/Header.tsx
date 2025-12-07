// components/Header.jsx
import React from 'react';
import { Search, Bell, User, Calendar } from 'lucide-react';       

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">     
        <div className="flex justify-between items-center h-16">   
          {/* Logo */}
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">              Medismart
            </span>
          </div>

          {/* Barre de recherche avancée */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un médecin, une spécialité, un lieu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Navigation utilisateur */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-blue-600">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Mon compte</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
