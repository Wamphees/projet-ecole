// PatientListDashboard.tsx
import React, { useState, useEffect } from 'react';

type AppointmentStatus = 'En attente' | 'Confirmé' | 'Annulé';
type AppointmentType = 'Consultation' | 'Suivi' | 'Urgence' | 'Téléconsultation';

interface Patient {
  id: number;
  name: string;
  type: AppointmentType;
  time: string;
  status: AppointmentStatus;
}

interface PatientListDashboardProps {
  patients?: Patient[];
  className?: string;
}

const defaultPatients: Patient[] = [
  { id: 1, name: 'Maria Dubois', type: 'Consultation', time: '09:00', status: 'Confirmé' },
  { id: 2, name: 'Jean Martin', type: 'Suivi', time: '09:30', status: 'Confirmé' },
  { id: 3, name: 'Sophie Laurent', type: 'Urgence', time: '10:30', status: 'En attente' },
  { id: 4, name: 'Pierre Durand', type: 'Consultation', time: '14:00', status: 'Confirmé' },
  { id: 5, name: 'Anne Moreau', type: 'Téléconsultation', time: '15:00', status: 'Confirmé' },
];

const PatientListDashboard: React.FC<PatientListDashboardProps> = ({ 
  patients = defaultPatients, 
  className = '' 
}) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<{ status: AppointmentStatus }>({ status: 'En attente' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gestion de la touche Échap
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({ status: patient.status });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted for patient:', selectedPatient?.name);
    console.log('New status:', formData.status);
    handleCloseModal();
  };

  const getStatusColor = (status: AppointmentStatus): string => {
    switch (status) {
      case 'Confirmé': return 'bg-green-50 text-green-700 border-green-200';
      case 'En attente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Annulé': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusDotColor = (status: AppointmentStatus): string => {
    switch (status) {
      case 'Confirmé': return 'bg-green-500';
      case 'En attente': return 'bg-amber-500';
      case 'Annulé': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: AppointmentStatus): string => {
    switch (status) {
      case 'Confirmé': return 'Confirmé';
      case 'En attente': return 'En attente';
      case 'Annulé': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full ${className}`}>
      {/* Header sobre pour dashboard */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Rendez-vous du jour</h3>
            <p className="text-xs text-gray-500 mt-0.5">{patients.length} patients</p>
          </div>
        </div>
      </div>
      
      {/* Liste compacte et sobre */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {patients.map((patient) => (
              <div 
                key={patient.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(patient.status)}`} />
                      <h4 className="text-sm font-medium text-gray-900 truncate">{patient.name}</h4>
                    </div>
                    <div className="mt-1.5 flex items-center text-xs text-gray-500">
                      <span className="truncate">{patient.type}</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">{patient.time}</span>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(patient.status)}`}>
                      {getStatusText(patient.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal sobre et professionnelle */}
      {isModalOpen && selectedPatient && (
        <>
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-200"
            onClick={handleCloseModal}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Modifier le statut</h3>
                  <button 
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Patient: {selectedPatient.name}</p>
              </div>

              {/* Patient Info */}
              <div className="px-6 py-4 space-y-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs font-medium text-gray-500 mb-1">Type de consultation</span>
                    <span className="font-medium text-gray-900">{selectedPatient.type}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 mb-1">Heure prévue</span>
                    <span className="font-medium text-gray-900">{selectedPatient.time}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 mr-3">Statut actuel:</span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(selectedPatient.status)}`}>
                    {getStatusText(selectedPatient.status)}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="mb-6">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau statut
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ status: e.target.value as AppointmentStatus })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="En attente">Pending</option>
                    <option value="Confirmé">Completed</option>
                    <option value="Annulé">Cancelled</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Ce changement sera enregistré dans le dossier du patient.</p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientListDashboard;