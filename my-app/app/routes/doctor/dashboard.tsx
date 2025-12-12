import { useAuth } from '../../contexts/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Dashboard_doctor from '~/components/dashboard_doctor/dashboard';

export default function PatientDashboard() {
    return(
        <Dashboard_doctor/>
    )
}

