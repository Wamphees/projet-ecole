import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import {NavUser} from "./nav-user";

export default function Navbar() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore
    }
    navigate("/");
  };

  return (
    <header className="bg-white/60 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-indigo-600">MedisMat</Link>
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="text-sm text-gray-700 hover:text-indigo-600 px-2 py-1 rounded">Accueil</Link>
              <Link to="/about" className="text-sm text-gray-700 hover:text-indigo-600 px-2 py-1 rounded">À propos</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <NavUser/>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 pt-3 pb-4 space-y-1">
            <Link to="/" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Accueil</Link>
            <Link to="/about" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">À propos</Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Connexion</Link>
                <Link to="/register" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Inscription</Link>
              </>
            ) : (
              <>
                {role === "patient" && <Link to="/patient/dashboard" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Mon Espace</Link>}
                {role === "medecin" && <Link to="/doctor/dashboard" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Mon Espace</Link>}
                {role === "admin" && <Link to="/admin/dashboard" className="block px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Gestion</Link>}
                <div className="border-t pt-2">
                  <div className="px-3 py-2 text-sm text-gray-700">{user?.name}</div>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base text-gray-700 hover:bg-gray-50 rounded">Déconnexion</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

