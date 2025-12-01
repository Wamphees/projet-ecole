import { BadgeCheckIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "../ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item"
export default function HistoryCard() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Item variant="outline">
        
        <ItemContent>
          <ItemTitle className="font-bold">Dr. Martin</ItemTitle>
          <ItemDescription>Cardiologie</ItemDescription>
          <ItemDescription>Consultation</ItemDescription>
          <ItemDescription>2024-01-15</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Voir les details
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}