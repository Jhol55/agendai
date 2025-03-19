import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Typography } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";

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

export const columns: ColumnDef<typeof dataMock[0]>[] = [
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
      <Typography variant="span" className="md:whitespace-nowrap">
        {row.getValue("name")}
      </Typography>
    ),
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <Typography variant="span">{row.getValue("description")}</Typography>
    ),
  },
  {
    accessorKey: "duration_minutes",
    header: "Duração (min)",
    cell: ({ row }) => (
      <Typography variant="span">
        {row.getValue("duration_minutes")} min
      </Typography>
    ),
  },
  {
    accessorKey: "price",
    header: "Preço (R$)",
    cell: ({ row }) => (
      <Typography variant="span">
        R$ {parseFloat(row.getValue("price")).toFixed(2)}
      </Typography>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <Typography variant="span">{row.getValue("category")}</Typography>
    ),
  },
  {
    accessorKey: "active",
    header: "Ativo",
    cell: ({ row }) => (
      <Typography variant="span">
        {row.getValue("active") ? "Sim" : "Não"}
      </Typography>
    ),
  },
];

export const Services = () => {
  return (
    <section className="w-full flex-1 px-10 md:my-10 my-3 bg-transparent dark:bg-neutral-900">
      <div>
        <Typography variant="h1">Serviços</Typography>
      </div>
      <div className="py-2 flex flex-col gap-2 flex-1 w-full">
        <DataTable columns={columns} data={dataMock} />
      </div>
    </section>
  );
};
