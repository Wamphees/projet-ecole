"use client"

import React, { useState } from "react"
import  AI_Prompt  from "../kokonutui/ai-prompt" 
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from 'lucide-react';

export default function FloatingAiButton() {
  const [open, setOpen] = useState(false)

//    <>
//       {/* Bouton flottant */}
//       <button
//         onClick={() => setOpen(true)}
//         className="fixed bottom-5 right-5 z-50 rounded-full bg-blue-600 text-white p-4 shadow-lg hover:bg-blue-700 transition"
//       >
//         💡 AI
//       </button>

//       {/* Composant AI avec animation */}
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ x: 400, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: 400, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             className="fixed bottom-20 right-5 z-50"
//           >
//             <div className="bg-white border rounded-lg shadow-lg p-4 w-[350px] relative">
//               {/* Bouton fermer */}
//               <button
//                 onClick={() => setOpen(false)}
//                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
//               >
//                 ✖
//               </button>

//               {/* Composant AI */}
//               <AI_Prompt/>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110"
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Fenêtre du chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            style={{ height: '600px', maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Assistant Virtuel</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-700 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

<AI_Prompt/>
            <div className="h-[calc(100%-56px)] overflow-hidden">
              <AI_Prompt />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
