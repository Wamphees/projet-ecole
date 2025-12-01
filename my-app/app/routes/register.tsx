import { GalleryVerticalEnd } from "lucide-react"
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

import { SignupForm } from "../components/ui/signup-form"
import { useState } from "react";

export default function SignupPage() {
  
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm />
      </div>
    </div>
  )
}
