// components/prescriptions/PrescriptionGenerator.tsx
import React, { useState } from 'react';
import { prescriptionApi } from '../../lib/documentApi';
import type { Prescription, Medication } from '../../lib/document.types';
import { Sparkles, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface Props {
  patientId: number;
  patientContext?: {
    age?: number;
    weight?: number;
    allergies?: string[];
    conditions?: string[];
  };
  onSuccess?: (prescription: Prescription) => void;
}

export const PrescriptionGenerator: React.FC<Props> = ({
  patientId,
  patientContext,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [medications, setMedications] = useState<Medication[]>([
    { medication: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [instructions, setInstructions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState<Prescription | null>(null);
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [aiWarnings, setAiWarnings] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateWithAI = async () => {
    if (aiPrompt.trim().length < 10) {
      setError('Veuillez décrire le traitement souhaité (min 10 caractères)');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await prescriptionApi.generateWithAI({
        patient_id: patientId,
        prompt: aiPrompt,
        context: patientContext,
      });

      setGeneratedPrescription(response.data);
      setAiNotes(response.ai_notes || null);
      setAiWarnings(response.ai_warnings || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    // Validation
    const validMeds = medications.filter(
      (m) => m.medication && m.dosage && m.frequency && m.duration
    );

    if (validMeds.length === 0) {
      setError('Veuillez ajouter au moins un médicament complet');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await prescriptionApi.createPrescription({
        patient_id: patientId,
        medications: validMeds,
        instructions,
      });

      setGeneratedPrescription(response.data!);
      onSuccess?.(response.data!);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setGenerating(false);
    }
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { medication: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleValidate = async () => {
    if (!generatedPrescription) return;

    try {
      await prescriptionApi.validatePrescription(generatedPrescription.id);
      alert('Ordonnance validée avec succès !');
      onSuccess?.(generatedPrescription);
    } catch (err: any) {
      alert('Erreur lors de la validation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélection du mode */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setMode('ai')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Générer avec l'IA</span>
            </div>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              mode === 'manual'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rédiger manuellement
          </button>
        </div>
      </div>

      {/* Génération avec IA */}
      {mode === 'ai' && !generatedPrescription && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Décrivez le traitement souhaité
          </h3>

          {/* Contexte patient */}
          {patientContext && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Contexte patient :</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {patientContext.age && <li>• Âge : {patientContext.age} ans</li>}
                {patientContext.weight && <li>• Poids : {patientContext.weight} kg</li>}
                {patientContext.allergies && patientContext.allergies.length > 0 && (
                  <li>• Allergies : {patientContext.allergies.join(', ')}</li>
                )}
                {patientContext.conditions && patientContext.conditions.length > 0 && (
                  <li>• Conditions : {patientContext.conditions.join(', ')}</li>)}
              </ul>
            </div>
          )}

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ex: Traitement pour hypertension légère, patient 65 ans sans antécédents cardiaques..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />

          <button
            onClick={handleGenerateWithAI}
            disabled={generating || aiPrompt.trim().length < 10}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Générer l'ordonnance</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Formulaire manuel */}
      {mode === 'manual' && !generatedPrescription && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Rédiger l'ordonnance</h3>

          {/* Médicaments */}
          {medications.map((med, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Médicament {index + 1}</span>
                {medications.length > 1 && (
                  <button
                    onClick={() => removeMedication(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nom du médicament"
                  value={med.medication}
                  onChange={(e) => updateMedication(index, 'medication', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (ex: 1 comprimé)"
                  value={med.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Fréquence (ex: 3 fois/jour)"
                  value={med.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Durée (ex: 7 jours)"
                  value={med.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="text"
                placeholder="Instructions (optionnel)"
                value={med.instructions || ''}
                onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            onClick={addMedication}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter un médicament</span>
          </button>

          {/* Instructions générales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions générales (optionnel)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions générales pour le patient..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            onClick={handleCreateManual}
            disabled={generating}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generating ? 'Création...' : 'Créer l\'ordonnance'}
          </button>
        </div>
      )}

      {/* Ordonnance générée */}
      {generatedPrescription && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ordonnance générée</h3>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              Brouillon
            </span>
          </div>

          {/* Avertissements IA */}
          {aiWarnings && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Avertissements :</p>
                <p className="text-sm text-yellow-700 mt-1">{aiWarnings}</p>
              </div>
            </div>
          )}

          {/* Notes IA */}
          {aiNotes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-900">Notes de l'IA :</p>
              <p className="text-sm text-blue-700 mt-1">{aiNotes}</p>
            </div>
          )}

          {/* Médicaments */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Médicaments prescrits :</h4>
            {generatedPrescription.medications.map((med, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{med.medication}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><span className="font-medium">Posologie:</span> {med.dosage}</p>
                  <p><span className="font-medium">Fréquence:</span> {med.frequency}</p>
                  <p><span className="font-medium">Durée:</span> {med.duration}</p>
                </div>
                {med.instructions && (
                  <p className="mt-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                    {med.instructions}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Instructions */}
          {generatedPrescription.instructions && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Instructions générales :</h4>
              <p className="text-gray-700">{generatedPrescription.instructions}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleValidate}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Valider et envoyer au patient</span>
            </button>
            <button
              onClick={() => setGeneratedPrescription(null)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Recommencer
            </button>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};