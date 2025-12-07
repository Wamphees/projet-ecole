// import { format } from "date-fns";
// import { useState, useEffect } from "react";
// import { Button } from "../ui/button";
// import { Calendar } from "../ui/calendar";
// import { ScrollArea } from "../ui/scroll-area";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/pophov";

// interface DatePickerProps {
//   value: { date: Date; time: string | null };
//   onChange: (val: { date: Date; time: string | null }) => void;
// }

// export function DatePicker({ value, onChange }: DatePickerProps) {
//   const today = new Date();

//   const [date, setDate] = useState<Date>(value.date || today);
//   const [time, setTime] = useState<string | null>(value.time || null);

//   // when user selects a time or date -> notify parent
//   useEffect(() => {
//     onChange({ date, time });
//   }, [date, time]);

//   const timeSlots = [
//     { time: "07:00", available: true },
//     { time: "08:00", available: true },
//     { time: "09:00", available: true },
//     { time: "10:00", available: true },
//     { time: "11:00", available: true },
//     { time: "12:00", available: true },
//     { time: "13:00", available: true },
//     { time: "14:00", available: true },
//     { time: "15:00", available: true },
//     { time: "16:00", available: true },
//     { time: "17:00", available: true },
//     { time: "18:00", available: true },
//   ];

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="outline" className="w-60">
//           {format(date, "dd MMM yyyy")} — {time || "Choisir l’heure"}
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className="w-80 relative left-73 top-26">
//         <div className="rounded-md border">
//           <div className="flex max-sm:flex-col">
//             <Calendar
//               className="p-2 sm:pe-5"
//               disabled={[{ before: today }]}
//               mode="single"
//               onSelect={(newDate) => {
//                 if (newDate) {
//                   setDate(newDate);
//                   setTime(null); // reset time when date changes
//                 }
//               }}
//               selected={date}
//             />

//             <div className="relative w-full max-sm:h-48 sm:w-40">
//               <div className="inset-0 py-4 max-sm:border-t">
//                 <ScrollArea className="h-full sm:border-s">
//                   <div className="space-y-3">
//                     <div className="flex h-5 shrink-0 items-center px-5">
//                       <p className="font-medium text-sm">
//                         {format(date, "EEEE, d")}
//                       </p>
//                     </div>
//                     <div className="grid gap-1 px-2 max-sm:grid-cols-2">
//                       {timeSlots.map((slot) => (
//                         <Button
//                           key={slot.time}
//                           className="w-full"
//                           disabled={!slot.available}
//                           onClick={() => setTime(slot.time)}
//                           size="sm"
//                           variant={time === slot.time ? "default" : "outline"}
//                         >
//                           {slot.time}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>
//                 </ScrollArea>
//               </div>
//             </div>
//           </div>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }


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
        <Button variant="outline" className="w-60">
          {format(date, "dd MMM yyyy")} — {time ? time : "Choisir l'heure"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 relative left-73 top-26">
        <div className="rounded-md border">
          <div className="flex max-sm:flex-col">
            <Calendar
              className="p-2 sm:pe-5"
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
                            className="w-full"
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