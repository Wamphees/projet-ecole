import React, { useState, useEffect } from "react";
import calendar from "public/calendar.png";
import close from "public/close.png";
import star from "public/star.png";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";
import axios from "axios";
import AuthService from "../../lib/auth";

// Types
interface Appointment {
  id: number;
  patient: {
    id: number;
    name: string;
    telephone: string | null;
  };
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
}

// Fonction pour générer les jours de la semaine
const getWeekDays = (date: Date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay() + 1; // Lundi
  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    days.push(day);
  }

  return days;
};

// Créneaux horaires de 8h à 18h
const timeSlots = Array.from({ length: 11 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, "0")}:00`;
});

const DoctorAgenda = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const weekDays = getWeekDays(currentWeek);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Formater la date de début de semaine
      const startOfWeek = weekDays[0].toISOString().split("T")[0];

      const response = await axios.get(
        "http://127.0.0.1:8000/api/doctors/appointments",
        {
          params: { week: startOfWeek },
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      setAppointments(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Erreur chargement rendez-vous:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simuler le chargement des rendez-vous
  useEffect(() => {
    loadAppointments();
  }, [currentWeek]);

  // const loadAppointments = async () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     const mockAppointments: Appointment[] = [
  //       {
  //         id: 1,
  //         patient: { id: 1, name: 'Jean Dupont', telephone: '+237 670 123 456' },
  //         appointment_date: weekDays[0].toISOString().split('T')[0],
  //         appointment_time: '09:00',
  //         consultation_type: 'Consultation générale',
  //         status: 'confirmed',
  //         notes: 'Contrôle de routine'
  //       },
  //       {
  //         id: 2,
  //         patient: { id: 2, name: 'Marie Kameni', telephone: '+237 670 234 567' },
  //         appointment_date: weekDays[1].toISOString().split('T')[0],
  //         appointment_time: '10:00',
  //         consultation_type: 'Consultation de suivi',
  //         status: 'confirmed',
  //         notes: null
  //       },
  //       {
  //         id: 3,
  //         patient: { id: 3, name: 'Paul Nkomo', telephone: '+237 670 345 678' },
  //         appointment_date: weekDays[2].toISOString().split('T')[0],
  //         appointment_time: '14:00',
  //         consultation_type: 'Urgence',
  //         status: 'pending',
  //         notes: 'Douleurs thoraciques'
  //       }
  //     ];
  //     setAppointments(mockAppointments);
  //     setLoading(false);
  //   }, 500);
  // };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getAppointmentForSlot = (day: Date, time: string) => {
    const dayStr = day.toISOString().split("T")[0];
    return appointments.find(
      (apt) => apt.appointment_date === dayStr && apt.appointment_time === time
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "pending":
        return "bg-gradient-to-br from-yellow-500 to-yellow-600";
      case "completed":
        return "bg-gradient-to-br from-green-500 to-green-600";
      case "cancelled":
        return "bg-gradient-to-br from-red-500 to-red-600";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600";
    }
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  return (
      /* Header */
    <div className="w-full h-screen bg-background from-slate-50 to-slate-100 p-3 -mt-4">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/30 aspect-video rounded-xl p-3 flex items-center justify-between" >
            <div className="bg-sky-200 rounded"><img src={calendar} alt="Calendar " width={35} height={35} /></div>
            <div><span className="text-xl">12</span> <span><p className="text-sm">Rendez-vous aujourd'hui</p></span></div>
          </div>
          <div className="bg-muted/30 aspect-video rounded-xl p-3 flex items-center gap-4" >
            <div className="bg-red-200 rounded"><img src={close} alt="CLose " width={35} height={35} /></div>
            <div><span className="text-xl">2</span> <span><p className="text-sm">Annulations</p></span></div>
          </div>
          <div className="bg-muted/30 aspect-video rounded-xl p-3 flex items-center gap-4" >
            <div className="bg-pink-200 rounded"><img src={star} alt="star " width={35} height={35} /></div>
            <div><span className="text-xl">4.8</span> <span><p className="text-sm">Satisfaction moyenne</p></span></div>
          </div>
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CalendarDays className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Planning de la semaine
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {currentWeek.toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Aujourd'hui
            </button>
            <button
              onClick={goToPreviousWeek}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* En-tête des jours */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="p-4 border-r border-gray-200">
            <span className="text-sm font-semibold text-gray-500">Heure</span>
          </div>
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                isToday(day) ? "bg-blue-50" : ""
              }`}
            >
              <div
                className={`font-bold ${isToday(day) ? "text-blue-600" : "text-gray-800"}`}
              >
                {day.toLocaleDateString("fr-FR", { weekday: "short" })}
              </div>
              <div
                className={`text-sm mt-1 ${isToday(day) ? "text-blue-500" : "text-gray-500"}`}
              >
                {day.getDate()}{" "}
                {day.toLocaleDateString("fr-FR", { month: "short" })}
              </div>
            </div>
          ))}
        </div>

        {/* Grille horaire */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          {timeSlots.map((time) => (
            <div
              key={time}
              className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 border-r border-gray-200 flex items-center justify-center bg-slate-50">
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{time}</span>
                </div>
              </div>

              {weekDays.map((day, idx) => {
                const appointment = getAppointmentForSlot(day, time);
                console.log(appointment);

                return (
                  <div
                    key={idx}
                    className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[80px] ${
                      isToday(day) ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {appointment ? (
                      <div
                        onClick={() => setSelectedAppointment(appointment)}
                        className={`
                          h-full rounded-xl p-3 cursor-pointer
                          ${getStatusColor(appointment.status)}
                          text-white shadow-lg
                          transform transition-all duration-300
                          hover:scale-105 hover:shadow-xl
                          animate-[fadeIn_0.5s_ease-in-out]
                          relative overflow-hidden
                          group
                        `}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="font-semibold text-sm truncate">
                              {appointment.patient.name}
                            </span>
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {appointment.consultation_type}
                          </div>
                          <div className="mt-2 text-xs font-semibold bg-white/20 rounded px-2 py-1 inline-block">
                            {appointment.status === "confirmed" && "✓ Confirmé"}
                            {appointment.status === "pending" &&
                              "⏳ En attente"}
                            {appointment.status === "completed" && "✓ Terminé"}
                            {appointment.status === "cancelled" && "✗ Annulé"}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal détails */}
      {selectedAppointment && (
        <div
          onClick={() => setSelectedAppointment(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-in-out]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-[slideUp_0.3s_ease-out]"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Détails du rendez-vous
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedAppointment.patient.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.patient.telephone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Date et heure</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(
                      selectedAppointment.appointment_date
                    ).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.appointment_time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedAppointment.consultation_type}
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAppointment(null)}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorAgenda;
