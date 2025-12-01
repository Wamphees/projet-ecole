import { BadgeCheckIcon, ChevronRightIcon } from "lucide-react"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item"

export function Notif() {
  return (
    <div className="flex w-full w-full flex-col gap-6">
      <Item variant="outline" className="flex flex-col">
        <h2 className="font-bold flex justify-start -ml-216 ">Notifications</h2>
        <div className="flex flex-row w-full justify-around">
            <ItemContent>
                <ItemTitle>Notifications par email</ItemTitle>
                <ItemDescription>
                    Recevoir les rappels de rendez-vous par email.
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Switch id="email" />
            </ItemActions>
        </div>
        <div className="flex flex-row w-full justify-around">
            <ItemContent>
            <ItemTitle>Notifications SMS</ItemTitle>
            <ItemDescription>
                Recevoir les rappels de rendez-vous par SMS.
            </ItemDescription>
            </ItemContent>
            <ItemActions>
            <Switch id="sms" />
            </ItemActions>
        </div>
        <div className="flex flex-row w-full justify-around">
            <ItemContent>
            <ItemTitle>Rappels de médicaments</ItemTitle>
            <ItemDescription>
                Recevoir les rappels de prise de médicaments.
            </ItemDescription>
            </ItemContent>
            <ItemActions>
            <Switch id="rappel" />
            </ItemActions>
        </div>
        
        
      </Item>
    </div>
  )
}
