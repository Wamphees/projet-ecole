"use client"

import React, {createContext, useContext, useEffect, useState } from "react"
import type {ReactNode} from "react"
import axios from "axios"

type DoctorsProviderProps = {
    children: ReactNode
}

export type Medecin ={
    id: string
    nom: string
    email : string
    tel : string
    etablissement: string
    specialite: string
    diplome : string
}

type DoctorsContextType = {
    medecins: Medecin[]
    refresh: () => void
    loading: boolean
}

const DoctorsContext = createContext<DoctorsContextType>({
  medecins: [],
  refresh: () => {},
  loading: false,
})

export const DoctorsProvider = ({children}: DoctorsProviderProps) => {
    const [medecins, setMedecins] = useState<Medecin[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const fetchDoctors = () =>{
        setLoading(true)
        axios
        .get<Medecin[]>('http://127.0.0.1:8000/api/doctors')
        .then((response)=>{     
            const doctorsArray = response.data.data
            const mapped = doctorsArray.map((d: any)=>({
                id : String(d.id),
                nom :d.name,
                email :d.email,
                tel :d.telephone,
                etablissement : d.etablissement,
                specialite : d.specialite,  
                diplome : d.diplome
            }))
            setMedecins(mapped)
            
        }).catch((err) => console.error("Erreur fetch doctors:", err))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchDoctors()
    }, [])

    return (
        <DoctorsContext.Provider value={{ medecins, refresh: fetchDoctors, loading }}>
            {children}
        </DoctorsContext.Provider>
    )       
}

export const useDoctors = () => useContext(DoctorsContext);