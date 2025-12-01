import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import './dashboard.css';

export function meta() {
  return [
    { title: 'Tableau de bord Médecin - MedisMat' },
    { name: 'description', content: 'Votre espace médecin' },
  ];
}

export default function DoctorDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['medecin']}>
      <div className="dashboard-container">
        <h1>Bienvenue, Dr. {user?.name}</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Mes Patients</h2>
            <p>Gérez votre liste de patients</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Rendez-vous</h2>
            <p>Consultez vos rendez-vous</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Dossiers</h2>
            <p>Accédez aux dossiers médicaux</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Messages</h2>
            <p>Communiquez avec vos patients</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
