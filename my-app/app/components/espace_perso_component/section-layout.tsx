import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Notif } from "./notification-section";
import HistoryCard from "./history-section";

export default function Tab() {
  return (
    <Tabs className="items-center w-full" defaultValue="tab-1">
      <TabsList className="h-auto w-full flex justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          value="tab-1"
        >
          Parametres
        </TabsTrigger>
        <TabsTrigger
          className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          value="tab-2"
        >
          Historiques
        </TabsTrigger>
        <TabsTrigger
          className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          value="tab-3"
        >
          Documents
        </TabsTrigger>
        <TabsTrigger
          className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          value="tab-4"
        >
          Mes informations
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1" className="w-full">
        <h1 className="text-xl font-bold mb-4 mt-3">Parametres</h1>
          <Notif />
      </TabsContent>
      <TabsContent value="tab-2" className="w-full">
        <h1 className="text-xl font-bold mb-4 mt-3">Historique</h1>
          <HistoryCard />
      </TabsContent>
      <TabsContent value="tab-3">
        <p className="p-4 text-center text-muted-foreground text-xs">
          Documents
        </p>
      </TabsContent>
      <TabsContent value="tab-4" className="w-full">
        <p className="p-4 text-center text-muted-foreground text-xs">
          Content for Tab 4
        </p>
      </TabsContent>
    </Tabs>
  );
}
