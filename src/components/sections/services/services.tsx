import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Typography } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { AddNewServiceDialog } from "./AddNewServiceDialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getServices } from "@/services/services";
import { ServiceType } from "@/models/Services";
import { Check, X } from "lucide-react";

const dataMock = [
  {
    id: 0,
    name: "teste",
    description: "testando",
    duration_minutes: 50,
    price: 10,
    category: "teste",
    active: true,
  },
];

export const columns: ColumnDef<ServiceType>[] = [
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
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <Typography variant="span">{row.getValue("id")}</Typography>
    ),
  },
  {
    accessorKey: "name",
    header: "Nome do Serviço",
    cell: ({ row }) => (
      <Typography variant="span" className="md:whitespace-nowrap ">
        {row.getValue("name")}
      </Typography>
    ),
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <Typography variant="span" className="!flex !justify-center">{row.getValue("description")}</Typography>
    ),
  },
  {
    accessorKey: "duration_minutes",
    header: "Duração (min)",
    cell: ({ row }) => (
      <Typography variant="span" className="!flex !justify-center">
        {row.getValue("duration_minutes")} min
      </Typography>
    ),
  },
  {
    accessorKey: "price",
    header: "Preço (R$)",
    cell: ({ row }) => (
      <Typography variant="span" className="whitespace-nowrap !flex !justify-center">
        R$ {parseFloat(row.getValue("price")).toFixed(2)}
      </Typography>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <Typography variant="span" className="!flex !justify-center">{row.getValue("category") || "N/A"}</Typography>
    ),
  },
  {
    accessorKey: "allow_in_person",
    header: "Presencial",
    cell: ({ row }) => (
      <Typography variant="span" className="!flex !justify-center">{row.getValue("allow_in_person") ? <Check className="text-green-400" /> : <X className="text-red-400" />}</Typography>
    ),
  },
  {
    accessorKey: "allow_online",
    header: "Online",
    cell: ({ row }) => (
      <Typography variant="span" className="!flex !justify-center">{row.getValue("allow_online") ? <Check className="text-green-400" /> : <X className="text-red-400" />}</Typography>

    ),
  },
  {
    accessorKey: "active",
    header: "Ativo",
    cell: ({ row }) => (
      <Typography variant="span" className="!flex !justify-center">
        {row.getValue("active") ? <Check className="text-green-400" /> : <X className="text-red-400" />}
      </Typography>
    ),
  },
];

export const Services = () => {
  const [services, setServices] = useState<ServiceType[]>();
  const [trigger, setTrigger] = useState(false);
  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

  useEffect(() => {
    getServices({}).then(setServices);
  }, [trigger])

  return (services?.length &&
    <section className="w-full h-[calc(100vh-100px)] px-4 bg-transparent dark:bg-neutral-900">
      <div className="absolute left-0 pt-4 pb-2 px-4 w-full flex items-center justify-between bg-white">
        <Typography variant="h1" className="z-30">Serviços</Typography>
        <AddNewServiceDialog onSubmitSuccess={() => handleUpdate()} />
      </div>
      <div className="py-2 mt-[4.5rem] flex flex-col gap-2 flex-1 w-full p-2 bg-white rounded-md">
        <DataTable columns={columns} data={services} className="bg-white" />
      </div>
    </section >
  );
};
