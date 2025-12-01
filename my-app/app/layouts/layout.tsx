import { SidebarProvider } from "../components/ui/sidebar"
import NavbarCon from "../components/navbar-connected";


export default function Nav() {
  return (
        <SidebarProvider>
            <NavbarCon/>
        </SidebarProvider>
  )
}
