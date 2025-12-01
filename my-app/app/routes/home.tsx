import type { Route } from "./+types/home";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "../components/ui/input-group";
import { Input } from "../components/ui/input";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Accueil - MedisMat" },
    { name: "description", content: "Bienvenue sur MedisMat - Plateforme de gestion médicale" },
  ];
}

export default function Home() {
  return (
    <>
    <div className=" one min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 ">
      <div className="bg-blue-600 rounded-lg shadow-lg p-8 w-full max-w-270">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Trouvez votre praticien</h1>
        <p className="text-white text-xl mb-6 text-center">Prenez rendez-vous en quelques clics avec des professionnels de santé près de chez vous</p>
        <div className="flex items-center justify-center"><InputGroup className="bg-white border-none w-120">
          <Input 
            className="bg-white border-none"
            type="text"
            placeholder="Praticien, etablissement..." 
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="secondary" className="bg-blue-600 p-3 text-white hover:bg-blue-700">Search</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
          </div>
      </div><br /> 

      {/* Cards section below the blue panel */}
      <div className="w-full max-w-270 mt-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">U</div>
              <div>
                <div className="font-semibold">Urgences</div>
                <div className="text-sm text-gray-600">Accès rapide aux services d'urgence</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">T</div>
              <div>
                <div className="font-semibold">Téléconsultations</div>
                <div className="text-sm text-gray-600">Consultez un médecin à distance</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">R</div>
              <div>
                <div className="font-semibold">Mes RDV</div>
                <div className="text-sm text-gray-600">Gérez vos rendez-vous à venir</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">H</div>
              <div>
                <div className="font-semibold">Historique</div>
                <div className="text-sm text-gray-600">Consultez votre historique médical</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   
    </>
    
    
  )
}

