import testImage from "../../../public/test.jpg"
import { Badge } from "../ui/badge"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../ui/item"

export type Medecin = {
  id: string
  nom: string
  email: string
  tel: string
  etablissement: string
  specialite: string
  diplome: string
}

interface ItemImageProps {
  doctor: Medecin
}

export function ItemImage({ doctor }: ItemImageProps) {
  return (
    <div className="flex w-full flex-col gap-6 border-blue-600">
      <ItemGroup className="gap-4 border-blue-600">
        <Item variant="outline" asChild role="listitem" className="border-blue-600">
          <a href="#">
            <ItemMedia variant="image">
              <img
                src={testImage}
                alt={doctor.nom}
                width={100}
                height={100}
                className="object-cover grayscale"
              />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1 text-blue-600">{doctor.nom}</ItemTitle>
              <ItemDescription>{doctor.specialite}</ItemDescription>
              <ItemDescription>{doctor.etablissement}</ItemDescription>
              <ItemDescription>{doctor.diplome}</ItemDescription>
            </ItemContent>
            <ItemContent className="flex flex-row">
              <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">Francais</Badge>
              <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600"> Anglais</Badge>
            </ItemContent>
          </a>
        </Item>
      </ItemGroup>
    </div>
  )
}
