import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/pophov";

interface TimeSlot {
  value: string; // Ex: "10:00"
  label: string; // Ex: "10h-11h"
}

interface DatePickerProps {
  value: { date: Date; time: string | null };
  onChange: (val: { date: Date; time: string | null }) => void;
  availableSlots?: TimeSlot[]; // NOUVEAU: Créneaux disponibles depuis le backend
  loading?: boolean; // NOUVEAU: Indicateur de chargement
}

export function DatePicker({ value, onChange, availableSlots = [], loading = false }: DatePickerProps) {
  const today = new Date();

  const [date, setDate] = useState<Date>(value.date || today);
  const [time, setTime] = useState<string | null>(value.time || null);

  // when user selects a time or date -> notify parent
  useEffect(() => {
    onChange({ date, time });
  }, [date, time]);

  // Réinitialiser le créneau sélectionné quand la date change
  useEffect(() => {
    setTime(null);
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-60 bg-linear-to-r from-blue-600 to-purple-700 text-white">
          {format(date, "dd MMM yyyy")} — {time ? time : "Choisir l'heure"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 relative left-73 top-26">
        <div className="rounded-md border">
          <div className="flex max-sm:flex-col border-blue-600">
            <Calendar
              className="p-2 sm:pe-5 border-blue-600"
              disabled={[{ before: today }]}
              mode="single"
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                }
              }}
              selected={date}
            />

            <div className="relative w-full max-sm:h-48 sm:w-40">
              <div className="inset-0 py-4 max-sm:border-t">
                <ScrollArea className="h-full sm:border-s">
                  <div className="space-y-3">
                    <div className="flex h-5 shrink-0 items-center px-5">
                      <p className="font-medium text-sm">
                        {format(date, "EEEE, d")}
                      </p>
                    </div>
                    <div className="grid gap-1 px-2 max-sm:grid-cols-2">
                      {loading ? (
                        <p className="text-sm text-gray-500 px-3">Chargement...</p>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-sm text-gray-500 px-3">Aucun créneau disponible</p>
                      ) : (
                        availableSlots.map((slot) => (
                          <Button
                            key={slot.value}
                            className="w-full bg-linear-to-r from-blue-600 to-purple-700 text-white"
                            onClick={() => setTime(slot.value)}
                            size="sm"
                            variant={time === slot.value ? "default" : "outline"}
                          >
                            {slot.label}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}