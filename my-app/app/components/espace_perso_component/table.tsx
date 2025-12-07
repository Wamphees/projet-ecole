"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

import { useDoctors } from "~/contexts/DoctorsContext"
import { Modal } from "../search_page/Modal"
import { ItemImage } from "../search_page/ItemImage"
import { ItemForm } from "../search_page/ItemForm"

/* ============================
       TYPES
=============================== */

export type Medecin ={
    id: string
    nom: string
    email : string
    tel : string
    etablissement: string
    specialite: string
    diplome : string
}


/* ============================
       COLONNES
=============================== */



/* ============================
       COMPONENT TABLE
=============================== */

export function DataTableDemo() {
    const {medecins, loading} = useDoctors();
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Medecin>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nom")}</div>
    ),
  },

  {
    accessorKey: "specialite",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Spécialité
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("specialite")}</div>,
  },

  {
    accessorKey: "etablissement",
    header: "Établissement",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("etablissement")}</div>
    ),
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const medecin = row.original
      return (
        <Button
          variant="default"
          onClick={() => handleReserve(medecin)}
        >
          Réserver
        </Button>
      )
    },
  },
]

  const table = useReactTable({
    data: medecins,
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const [modalOpen, setModalOpen] = React.useState(false)
  const [selectedDoctor, setSelectedDoctor] = React.useState<Medecin | null>(null)

  const handleReserve = (doctor: Medecin) => {
    setSelectedDoctor(doctor)
    setModalOpen(true)
  }




  return (
    <div className="w-full">

      {/* 🔥 FILTRES SPÉCIALITÉ + ÉTABLISSEMENT */}
      <div className="flex items-center gap-4 py-4">

        {/* Filtrer par spécialité */}
        <Input
          placeholder="Filtrer par spécialité..."
          value={(table.getColumn("specialite")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("specialite")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* Filtrer par établissement */}
        <Input
          placeholder="Filtrer par établissement..."
          value={(table.getColumn("etablissement")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("etablissement")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* GESTION DES COLONNES */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colonnes
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Réservation">
        {selectedDoctor ? (
          <div>
            <div className="bg-white rounded-lg p-6 w-full relative" >
                <ItemImage doctor={selectedDoctor} />
                {/* <ItemForm /> */}
                <ItemForm doctorId={Number(selectedDoctor.id)} />
            </div>
        </div>
        ) : null}
      </Modal>

      {/* FOOTER */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} sélectionné(s)
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
