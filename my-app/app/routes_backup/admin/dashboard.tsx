import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import './dashboard.css';

export function meta() {
  return [
    { title: 'Tableau de bord Administrateur - MedisMat' },
    { name: 'description', content: 'Votre espace administrateur' },
  ];
}

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="dashboard-container">
        <h1>Gestion Système</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Utilisateurs</h2>
            <p>Gérez tous les utilisateurs du système</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Rapports</h2>
            <p>Consultez les rapports d'activité</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Paramètres</h2>
            <p>Configurez le système</p>
          </div>
          
          <div className="dashboard-card">
            <h2>Audit</h2>
            <p>Consultez les logs d'audit</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
