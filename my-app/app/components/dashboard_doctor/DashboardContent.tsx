import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import { useDashboard } from "../../contexts/DashboardContext";
import DoctorAgenda from "./DoctorAgenda";
import DoctorAvailabilitySettings from "./DoctorAvailabilitySettings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";

export function DashboardContent() {
  const { currentPage } = useDashboard();

  return (
    <SidebarInset className="ml-0 mr-[250px]">
      <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Project Management & Task Tracking
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-4">
        {currentPage === "Home" && <DoctorAgenda />}
        {currentPage === "agenda" && <DoctorAgenda />}
        {currentPage === "Mes crenaux" && <DoctorAvailabilitySettings />}
        {currentPage === "Inbox" && <h1>Inbox</h1>}
        {currentPage === "ask" && <h1>Ask AI</h1>}
        {currentPage === "search" && <h1>Search</h1>}
      </div>
    </SidebarInset>
  );
}
