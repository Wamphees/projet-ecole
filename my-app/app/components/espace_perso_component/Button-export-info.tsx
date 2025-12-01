
import { Button } from "../ui/button"

import { toast } from "sonner"

export function ButtonExportInfo() {
  return (
    <div className="flex w-full gap-2">
      <Button
        variant="outline"
        onClick={() => toast.success("Les données ont été exportées")}
        className="w-full text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
      >
        Exporter les données
      </Button>
    </div>
  )
}

