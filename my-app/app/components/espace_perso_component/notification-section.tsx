import { BadgeCheckIcon, ChevronRightIcon } from "lucide-react"
import { Switch } from "../ui/switch"
import { ButtonDeleteAccount } from "./Button-delete-Account"
import { Toaster } from "../ui/sonner"
import {ButtonExportInfo} from "./Button-export-info"

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
    <div className="flex w-full flex-col gap-6">
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

      <div className="flex w-full flex-col gap-6">
        <Item variant="outline" className="flex flex-col">
          <h2 className="font-bold flex justify-start -ml-206 ">Confidentialité</h2>
          <div className="flex flex-row w-full justify-around">
              <ItemContent>
                  <ItemTitle>Partage de données</ItemTitle>
                  <ItemDescription>
                      Autoriser le partage de données anonymisées pour la recherche
                  </ItemDescription>
              </ItemContent>
              <ItemActions>
                  <Switch id="auth_send" />
              </ItemActions>
          </div>
          <div className="flex flex-row w-full justify-around">
              <ItemContent>
              <ItemTitle>Analyses d'utilisation</ItemTitle>
              <ItemDescription>
                  Autoriser la collecte de données d'utilisation anonymisées.
              </ItemDescription>
              </ItemContent>
              <ItemActions>
              <Switch id="collecte" />
              </ItemActions>
          </div>
          
        </Item>
      </div>

      <div className="flex w-full flex-col gap-6">
        <Item variant="outline" className="flex flex-col">
          <h2 className="font-bold flex justify-start -ml-206 ">Actions du compte</h2>
          <div className="flex flex-row w-full justify-around">
              <ItemContent>
              <ButtonExportInfo/>
                      <Toaster position="top-center"/>
              </ItemContent>
          </div>
          <div className="flex flex-row w-full justify-around">
              <ItemContent>
              <ButtonDeleteAccount/>
              </ItemContent>
          </div>
          
        </Item>
      </div>
    </div>
    
  )
}
