import { SidebarLeft } from "../sidebar-left";
import { SidebarRight } from "../sidebar-right";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import DoctorAgenda from "./DoctorAgenda";
import DoctorAvailabilitySettings from "./DoctorAvailabilitySettings";
import {
  DashboardProvider,
  useDashboard,
} from "../../contexts/DashboardContext";
import { DashboardContent } from "./DashboardContent";

export default function Dashboard_doctor() {
  return (
    <DashboardProvider>
      <SidebarProvider>
        <SidebarLeft />
        {/* <SidebarInset>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl" />
          <DoctorAvailabilitySettings/>
          <div className="bg-muted/50 mx-auto h-[100vh] w-full max-w-3xl rounded-xl" />
          <DoctorAgenda/>
        </div>
      </SidebarInset> */}
      <DashboardContent />
        <SidebarRight />
      </SidebarProvider>
    </DashboardProvider>
  );
}
