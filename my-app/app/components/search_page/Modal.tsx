"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Button } from "../ui/button"

/* ============================
       COMPOSANT MODAL
=============================== */

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 w-250 relative"
        onClick={(e) => e.stopPropagation()} // empêcher la fermeture au clic dans le contenu
      >
        <div>{children}</div>
        <div className=" flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          
        </div>
      </div>
    </div>
  )
}
