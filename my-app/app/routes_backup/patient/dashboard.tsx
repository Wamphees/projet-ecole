import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import type { Route } from './+types/dashboard';
import './dashboard.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Tableau de bord Patient - MedisMat' },
    { name: 'description', content: 'Votre espace patient' },
  ];
}

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['patient']}>
      <div className="dashboard-container">
        <h1>Bienvenue, {user?.name}</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Mes Rendez-vous</h2>
            <p>Consultez vos rendez-vous médicaux</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Mon Profil</h2>
            <p>Gérez vos informations personnelles</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Mes Dossiers Médicaux</h2>
            <p>Accédez à votre historique médical</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Messages</h2>
            <p>Communiquez avec votre médecin</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
