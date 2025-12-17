import React, { useState, useEffect } from "react";
import PatientList from "../../lib/patientList";
import type { Appointment } from "../../lib/patientList";
import axios from "axios";
import AuthService from "../../lib/auth";


type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
type AppointmentType =
  | "Consultation générale"
  | "Consultation"
  | "Suivi"
  | "Urgence"
  | "Téléconsultation";

interface Patient {
  id: number;
  name: string;
  type: AppointmentType;
  time: string;
  status: AppointmentStatus;
}

interface PatientListDashboardProps {
  className?: string;
}

const PatientListDashboard: React.FC<PatientListDashboardProps> = ({
  className = "",
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<{ status: AppointmentStatus }>({
    status: "pending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===========================
     FETCH API + MAPPING
     =========================== */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointments: Appointment[] =
          await PatientList.getPatientAppointments();

        const mappedPatients: Patient[] = appointments.map((a) => ({
          id: a.id,
          name: a.patient.name,
          type: a.consultation_type as AppointmentType,
          time: a.appointment_time,
          status: a.status as AppointmentStatus,
        }));

        setPatients(mappedPatients);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  /* ===========================
     MODAL & EVENTS
     =========================== */
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/appointments/${selectedPatient.id}/status`,
        { status: formData.status },
        { headers: { Authorization: `Bearer ${AuthService.getToken()}` } }
      );

      if (response.data.success) {
        // Mettre à jour le state local pour rafraîchir la liste
        setPatients((prev) =>
          prev.map((p) =>
            p.id === selectedPatient.id ? { ...p, status: formData.status } : p
          )
        );
        handleCloseModal();
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  /* ===========================
     STATUS HELPERS
     =========================== */
  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusDotColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-amber-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  /* ===========================
     RENDER
     =========================== */
  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Rendez-vous du jour
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {patients.length} patients
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {patients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => handlePatientClick(patient)}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(
                      patient.status
                    )}`}
                  />
                  <strong>{patient.name}</strong>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {patient.type} • {patient.time}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-4 rounded-2xl flex text-center justify-center items-center whitespace-nowrap h-0 border  ${getStatusColor(
                  patient.status
                )}`}
              >
                {getStatusText(patient.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && selectedPatient && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={handleCloseModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="font-semibold mb-4">
                Modifier le statut — {selectedPatient.name}
              </h3>

              <form onSubmit={handleSubmit}>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      status: e.target.value as AppointmentStatus,
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="cancelled">Annulé</option>
                </select>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={handleCloseModal}>
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
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
