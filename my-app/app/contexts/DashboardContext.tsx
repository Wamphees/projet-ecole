import { createContext, useContext, useState } from "react";

type DashboardContextType = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
};

const DashboardContext = createContext<DashboardContextType>({
  currentPage: "home",
  setCurrentPage: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState("Home");

  return (
    <DashboardContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
