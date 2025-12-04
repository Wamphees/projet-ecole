import { GalleryVerticalEnd } from "lucide-react"
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

import { useState } from "react";
import { DataTableDemo } from "~/components/espace_perso_component/table";

export default function SignupPage() {
  
  return (
    <div className="bg-muted w-full flex min-h-svh flex-col items-center justify-center gap-6 md:p-10">
      <div className="flex w-full flex-col gap-6">
        <DataTableDemo />
      </div>
    </div>
  )
}