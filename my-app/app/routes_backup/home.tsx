import type { Route } from "./+types/home";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router";
import "./home.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Accueil - MedisMat" },
    { name: "description", content: "Bienvenue sur MedisMat - Plateforme de gestion médicale" },
  ];
}

export default function Home() {
  const { isAuthenticated, user, role } = useAuth();

  return (
    <div className="home-container">
      <section className="hero">
        <h1>MedisMat</h1>
        <p>Plateforme de gestion médicale moderne</p>
        
        {!isAuthenticated && (
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              S'inscrire
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Se connecter
            </Link>
          </div>
        )}
      </section>

      {isAuthenticated && (
        <section className="welcome-section">
          <h2>Bienvenue, {user?.name}</h2>
          <p>Rôle: <strong>{role === 'medecin' ? 'Médecin' : role === 'admin' ? 'Administrateur' : 'Patient'}</strong></p>
          
          <div className="quick-links">
            {role === 'patient' && (
              <>
                <Link to="/patient/dashboard" className="quick-link">
                  📋 Mon Tableau de Bord
                </Link>
              </>
            )}
            {role === 'medecin' && (
              <>
                <Link to="/doctor/dashboard" className="quick-link">
                  📋 Mon Tableau de Bord
                </Link>
              </>
            )}
            {role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="quick-link">
                  ⚙️ Gestion du Système
                </Link>
              </>
            )}
          </div>
        </section>
      )}

      <section className="features">
        <h2>Nos Services</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>👨‍⚕️ Pour les Patients</h3>
            <p>Consultez vos rendez-vous, accédez à vos dossiers médicaux et communiquez avec vos médecins.</p>
          </div>
          <div className="feature">
            <h3>🏥 Pour les Médecins</h3>
            <p>Gérez vos patients, planifiez vos rendez-vous et consultez les dossiers médicaux.</p>
          </div>
          <div className="feature">
            <h3>🔐 Pour les Administrateurs</h3>
            <p>Administrez le système, gérez les utilisateurs et consultez les rapports d'activité.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
