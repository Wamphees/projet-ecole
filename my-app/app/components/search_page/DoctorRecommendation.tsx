"use client";

import React, { useState } from 'react';
import { X, Sparkles, User, Stethoscope, Building2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {Modal} from '../search_page/Modal'; 
import {ItemImage} from '../search_page/ItemImage'; 
import { ItemForm } from '../search_page/ItemForm';

// Types (gardez les mêmes)
interface Doctor {
  id: number;
  name: string;
  email: string;
  telephone: string;
  specialite: string;
  etablissement: string;
  diplome: string;
  has_availabilities: boolean;
}

interface RecommendationResult {
  ai_recommendation: {
    specialty: string;
    urgency: string;
    reason: string;
  };
  doctors: Doctor[];
  total_found: number;
}

interface DoctorRecommendationProps {
  isOpen: boolean;
  onClose: () => void;
}

const DoctorRecommendation: React.FC<DoctorRecommendationProps> = ({
  isOpen,
  onClose,
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Nouvel état pour gérer le modal de réservation
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleRecommendation = async () => {
    if (!symptoms.trim()) {
      setError('Veuillez décrire vos symptômes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/doctors/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Erreur lors de la recommandation');
      }
    } catch (err: any) {
      setError('Erreur de connexion au serveur');
      console.error('Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
    setError(null);
  };

  // Fonction pour ouvrir le modal de réservation
  const handleViewSlots = (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor);
    setBookingModalOpen(true);
  };

  // Fonction pour fermer le modal de réservation
  const handleCloseBooking = () => {
    setBookingModalOpen(false);
    setSelectedDoctorForBooking(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'routine':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
      case 'emergency':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-purple-700 px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Recommandation IA</h2>
                      <p className="text-purple-100 text-sm mt-0.5">
                        Trouvez le bon médecin selon vos symptômes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 88px)' }}>
                  {/* Input Section */}
                  {!result && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                          Décrivez vos symptômes
                        </label>
                        <textarea
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          placeholder="Ex: J'ai des maux de tête fréquents depuis 3 jours, accompagnés de fatigue..."
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:bg-gray-800 dark:text-white transition-all resize-none"
                          rows={5}
                          disabled={loading}
                        />
                      </div>

                      {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-red-800 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        onClick={handleRecommendation}
                        disabled={loading || !symptoms.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Analyse en cours...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <span>Obtenir une recommandation</span>
                          </div>
                        )}
                      </button>

                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        💡 Plus vous êtes précis, meilleure sera la recommandation
                      </p>
                    </div>
                  )}

                  {/* Results Section */}
                  {result && (
                    <div className="space-y-6">
                      {/* AI Recommendation */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                              Analyse IA
                            </h3>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Spécialité recommandée :
                                </span>
                                <p className="font-semibold text-blue-600 dark:text-purple-300 text-lg">
                                  {result.ai_recommendation.specialty}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Niveau d'urgence :
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border-2 ${getUrgencyColor(
                                      result.ai_recommendation.urgency
                                    )}`}
                                  >
                                    {getUrgencyIcon(result.ai_recommendation.urgency)}
                                    {result.ai_recommendation.urgency.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 mt-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {result.ai_recommendation.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Doctors List */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Médecins disponibles ({result.total_found})
                        </h3>

                        {result.doctors.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400">
                              Aucun médecin trouvé pour cette spécialité
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {result.doctors.map((doctor) => (
                              <motion.div
                                key={doctor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-500 hover:shadow-lg transition-all duration-200"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                        {doctor.name}
                                      </h4>
                                      {doctor.has_availabilities && (
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                          Disponible
                                        </span>
                                      )}
                                    </div>

                                    <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4 flex-shrink-0" />
                                        <span>{doctor.specialite}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 flex-shrink-0" />
                                        <span>{doctor.etablissement}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleViewSlots(doctor)}
                                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-all font-medium text-sm"
                                  >
                                    Voir créneaux
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reset Button */}
                      <button
                        onClick={handleReset}
                        className="w-full border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        Nouvelle recherche
                      </button>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      ⚠️ <strong>Important :</strong> Cette recommandation est basée sur une analyse
                      automatique. Elle ne remplace pas l'avis d'un professionnel de santé qualifié.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de réservation */}
      <Modal 
        isOpen={bookingModalOpen} 
        onClose={handleCloseBooking} 
        title="Réservation"
      >
        {selectedDoctorForBooking ? (
          <div>
            <div className="bg-white rounded-lg p-6 w-full relative">
              <ItemImage doctor={selectedDoctorForBooking} />
              <ItemForm doctorId={Number(selectedDoctorForBooking.id)} />
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default DoctorRecommendation;