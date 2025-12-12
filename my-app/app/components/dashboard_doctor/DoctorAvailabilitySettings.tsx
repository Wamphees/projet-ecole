import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, Calendar, Check, X } from 'lucide-react';

// Types
interface DayAvailability {
  id?: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  consultation_duration: number;
  is_active: boolean;
}

const daysOfWeek = [
  { value: 'monday', label: 'Lundi', emoji: '📅' },
  { value: 'tuesday', label: 'Mardi', emoji: '📅' },
  { value: 'wednesday', label: 'Mercredi', emoji: '📅' },
  { value: 'thursday', label: 'Jeudi', emoji: '📅' },
  { value: 'friday', label: 'Vendredi', emoji: '📅' },
  { value: 'saturday', label: 'Samedi', emoji: '📅' },
  { value: 'sunday', label: 'Dimanche', emoji: '🌴' },
];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 heures' },
];

const DoctorAvailabilitySettings = () => {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Charger les disponibilités existantes
  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    setLoading(true);
    // Simuler le chargement - Remplacer par votre appel API
    setTimeout(() => {
      const mockData: DayAvailability[] = [
        {
          id: 1,
          day_of_week: 'monday',
          start_time: '09:00',
          end_time: '17:00',
          consultation_duration: 60,
          is_active: true,
        },
        {
          id: 2,
          day_of_week: 'tuesday',
          start_time: '09:00',
          end_time: '17:00',
          consultation_duration: 60,
          is_active: true,
        },
      ];
      setAvailabilities(mockData);
      setLoading(false);
    }, 500);
  };

  const addAvailability = (day: string) => {
    const newAvailability: DayAvailability = {
      day_of_week: day as any,
      start_time: '09:00',
      end_time: '17:00',
      consultation_duration: 60,
      is_active: true,
    };
    setAvailabilities([...availabilities, newAvailability]);
  };

  const removeAvailability = (index: number) => {
    setAvailabilities(availabilities.filter((_, i) => i !== index));
  };

  const updateAvailability = (index: number, field: keyof DayAvailability, value: any) => {
    const updated = [...availabilities];
    updated[index] = { ...updated[index], [field]: value };
    setAvailabilities(updated);
  };

  const toggleDay = (index: number) => {
    const updated = [...availabilities];
    updated[index].is_active = !updated[index].is_active;
    setAvailabilities(updated);
  };

  const saveAvailabilities = async () => {
    setSaving(true);
    // Simuler la sauvegarde - Remplacer par votre appel API
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const getDayAvailabilities = (day: string) => {
    return availabilities.filter(a => a.day_of_week === day);
  };

  const getDayColor = (day: string) => {
    const dayAvails = getDayAvailabilities(day);
    if (dayAvails.length === 0) return 'bg-gray-100 border-gray-200';
    if (dayAvails.some(a => a.is_active)) return 'bg-green-50 border-green-200';
    return 'bg-gray-100 border-gray-200';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mes Disponibilités
                </h1>
                <p className="text-gray-500 mt-1">Configurez vos horaires de consultation</p>
              </div>
            </div>
            <button
              onClick={saveAvailabilities}
              disabled={saving}
              className="
                flex items-center gap-2 px-6 py-3 
                bg-gradient-to-r from-purple-600 to-pink-600 
                text-white rounded-xl font-semibold
                hover:from-purple-700 hover:to-pink-700
                transform transition-all duration-300
                hover:scale-105 hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grille des jours */}
      <div className="max-w-7xl mx-auto grid gap-6">
        {daysOfWeek.map((day) => {
          const dayAvails = getDayAvailabilities(day.value);
          const hasAvailability = dayAvails.length > 0;

          return (
            <div
              key={day.value}
              className={`
                bg-white rounded-3xl shadow-xl p-6 border-2
                transform transition-all duration-300
                hover:shadow-2xl hover:scale-[1.01]
                ${getDayColor(day.value)}
              `}
            >
              {/* En-tête du jour */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{day.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{day.label}</h3>
                    {hasAvailability && (
                      <p className="text-sm text-gray-500">
                        {dayAvails.length} plage{dayAvails.length > 1 ? 's' : ''} horaire{dayAvails.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addAvailability(day.value)}
                  className="
                    flex items-center gap-2 px-4 py-2
                    bg-gradient-to-r from-blue-500 to-cyan-500
                    text-white rounded-xl font-medium
                    hover:from-blue-600 hover:to-cyan-600
                    transform transition-all duration-200
                    hover:scale-105 shadow-lg
                  "
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter une plage</span>
                </button>
              </div>

              {/* Plages horaires */}
              {dayAvails.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune disponibilité configurée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availabilities.map((avail, index) => {
                    if (avail.day_of_week !== day.value) return null;

                    return (
                      <div
                        key={index}
                        className={`
                          relative p-5 rounded-2xl border-2
                          transition-all duration-300
                          ${avail.is_active 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 opacity-60'
                          }
                        `}
                      >
                        {/* Toggle actif/inactif */}
                        <button
                          onClick={() => toggleDay(index)}
                          className="absolute top-3 right-3 z-10"
                        >
                          <div className={`
                            w-12 h-6 rounded-full transition-all duration-300
                            ${avail.is_active ? 'bg-green-500' : 'bg-gray-300'}
                          `}>
                            <div className={`
                              w-5 h-5 bg-white rounded-full shadow-md
                              transform transition-all duration-300 mt-0.5
                              ${avail.is_active ? 'translate-x-6 ml-1' : 'translate-x-0 ml-0.5'}
                            `}></div>
                          </div>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Heure de début */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Début
                            </label>
                            <select
                              value={avail.start_time}
                              onChange={(e) => updateAvailability(index, 'start_time', e.target.value)}
                              className="
                                w-full px-4 py-2 rounded-xl border-2 border-gray-200
                                focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                                transition-all duration-200
                              "
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>

                          {/* Heure de fin */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Fin
                            </label>
                            <select
                              value={avail.end_time}
                              onChange={(e) => updateAvailability(index, 'end_time', e.target.value)}
                              className="
                                w-full px-4 py-2 rounded-xl border-2 border-gray-200
                                focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                                transition-all duration-200
                              "
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                          </div>

                          {/* Durée consultation */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Durée consultation
                            </label>
                            <select
                              value={avail.consultation_duration}
                              onChange={(e) => updateAvailability(index, 'consultation_duration', Number(e.target.value))}
                              className="
                                w-full px-4 py-2 rounded-xl border-2 border-gray-200
                                focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                                transition-all duration-200
                              "
                            >
                              {durationOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Bouton supprimer */}
                          <div className="flex items-end">
                            <button
                              onClick={() => removeAvailability(index)}
                              className="
                                w-full px-4 py-2 rounded-xl
                                bg-red-500 text-white font-medium
                                hover:bg-red-600
                                transform transition-all duration-200
                                hover:scale-105
                                flex items-center justify-center gap-2
                              "
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>

                        {/* Aperçu des créneaux */}
                        {avail.is_active && (
                          <div className="mt-4 p-3 bg-white/50 rounded-xl">
                            <p className="text-sm text-gray-600">
                              ⏱️ Créneaux générés : <strong>{avail.start_time}</strong> → <strong>{avail.end_time}</strong>
                              <span className="ml-2 text-purple-600 font-semibold">
                                ({Math.floor((parseInt(avail.end_time) - parseInt(avail.start_time)) * 60 / avail.consultation_duration)} consultations possibles)
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Message de succès flottant */}
      {success && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
          <Check className="w-6 h-6" />
          <span className="font-semibold">Disponibilités enregistrées avec succès !</span>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
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

export default DoctorAvailabilitySettings;