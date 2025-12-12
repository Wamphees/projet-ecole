"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { DatePicker } from "./DatePicker";
import appointmentService from "../../lib/appointmentService";
import type { ConsultationType } from "../../lib/appointmentService";
import availabilityService from "../../lib/availabilityService";
import type { TimeSlot } from "../../lib/availabilityService";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "../ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../ui/item";


interface ItemFormProps {
  doctorId: number;
}

export function ItemForm({ doctorId }: ItemFormProps) {
  const { isAuthenticated } = useAuth();
  
  const [typeConsultation, setTypeConsultation] = useState("Consultation générale");
  const [rdv, setRdv] = useState<{
    date: Date;
    time: string | null;
  }>({
    date: new Date(),
    time: null,
  });

  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Charger les types de consultation au montage
  useEffect(() => {
    loadConsultationTypes();
  }, []);

  // Charger les créneaux disponibles quand la date change
  useEffect(() => {
    if (rdv.date && doctorId) {
      loadAvailableSlots();
    }
  }, [rdv.date, doctorId]);

  const loadConsultationTypes = async () => {
    try {
      const types = await appointmentService.getConsultationTypes();
      setConsultationTypes(types);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des types de consultation");
    }
  };

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const formattedDate = rdv.date.toISOString().split('T')[0];
      const slots = await availabilityService.getAvailableSlots(doctorId, formattedDate);
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        toast.info("Aucun créneau disponible pour cette date");
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement des créneaux");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour prendre un rendez-vous");
      return;
    }

    if (!rdv.time) {
      toast.error("Veuillez sélectionner un créneau horaire");
      return;
    }

    // Trouver l'ID du type de consultation sélectionné
    const selectedType = consultationTypes.find(t => t.name === typeConsultation);
    if (!selectedType) {
      toast.error("Type de consultation invalide");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = rdv.date.toISOString().split('T')[0];

      await appointmentService.createAppointment({
        doctor_id: doctorId,
        appointment_date: formattedDate,
        appointment_time: rdv.time,
        consultation_type_id: selectedType.id,
      });

      toast.success("Rendez-vous créé avec succès !", {
        description: `Votre rendez-vous a été confirmé pour le ${formattedDate} à ${rdv.time}`,
      });

      // Réinitialiser et recharger
      setRdv({ ...rdv, time: null });
      loadAvailableSlots();

    } catch (error: any) {
      toast.error("Erreur lors de la création du rendez-vous", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
 
    
  };

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
      <ItemGroup className="gap-4">
        <ItemTitle className="mt-3 text-xl font-bold">
          Type de consultation
        </ItemTitle>
        <FieldGroup>
          <FieldSet>
            <RadioGroup
              className="flex flex-row"
              defaultValue="Consultation générale"
              onValueChange={(val)=>setTypeConsultation(val)}
            >
              <FieldLabel htmlFor="a">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Consultation générale</FieldTitle>
                    <FieldDescription>
                      Run GPU workloads on a K8s configured cluster.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="Consultation générale" id="a" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="vm2">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Téléconsultation</FieldTitle>
                    <FieldDescription>
                      Access a VM configured cluster to run GPU workloads.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="Téléconsultation" id="vm2" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="vm4">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Consultation d'urgence</FieldTitle>
                    <FieldDescription>
                      Access a VM configured cluster to run GPU workloads.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="Consultation d'urgence" id="vm4" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="vm5">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Bilan de santé</FieldTitle>
                    <FieldDescription>
                      Access a VM configured cluster to run GPU workloads.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="Bilan de santé" id="vm5" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>
        <div className="flex flex-row h-20  items-center gap-2 text-center">
          <ItemTitle className="text-xl  flex items-center mb-5 font-bold relative top-2">
            Horaire
          </ItemTitle>
          <DatePicker 
            value={rdv} 
            onChange={setRdv}
            availableSlots={availableSlots}
            loading={loadingSlots}
          />
        </div>
        <div className="flex justify-end absolute left-195 top-113">
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            variant="outline"
            type="submit"
            disabled={loading || !rdv.time}
          >
            {loading ? "Envoi..." : "Valider"}
          </Button>
        </div>
      </ItemGroup>
    </form>
  );
}