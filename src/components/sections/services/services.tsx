import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Typography } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { AddNewServiceDialog } from "./AddNewServiceDialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getServices } from "@/services/services";
import { ServiceType } from "@/models/Services";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconEdit } from "@tabler/icons-react";
import { EditServiceDialog } from "./EditServiceDialog";
import { RemoveServicesDialog } from "./RemoveServicesDialog";

type RawServiceType = {
  id: string,
  name: string,
  price: number,
  description: string,
  duration_minutes: number,
  allow_online: boolean,
  allow_in_person: boolean,
  active: boolean
}


export const Services = () => {
  const [services, setServices] = useState<RawServiceType[]>();
  const [trigger, setTrigger] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);
  const [serviceSearchValue, setServiceSearchValue] = useState("");
  const [selectedServices, setSelectedServices] = useState<Row<RawServiceType>[]>([]);

  const columns = useMemo<ColumnDef<RawServiceType>[]>(() => [
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
      header: "Editar",
      cell: ({ row }) => (
        <div className="flex justify-center !p-0 !h-fit w-full -translate-y-[8px] hover:bg-transparent">
          <EditServiceDialog service={row.original} onSubmitSuccess={() => handleUpdate()} />
        </div>
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
        <Typography variant="span" className="min-w-48">{row.getValue("description")}</Typography>
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
      header: "Valor (R$)",
      cell: ({ row }) => (
        <Typography variant="span" className="whitespace-nowrap !flex !justify-center">
          R$ {parseFloat(row.getValue("price")).toFixed(2)}
        </Typography>
      ),
    },
    // {
    //   accessorKey: "category",
    //   header: "Categoria",
    //   cell: ({ row }) => (
    //     <Typography variant="span" className="!flex !justify-center">{row.getValue("category") || "N/A"}</Typography>
    //   ),
    // },
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
  ], [handleUpdate]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      getServices({ name: serviceSearchValue }).then(data => {
        setServices(data.services);
        setTotalPages(data.totalPages);
      });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [serviceSearchValue, trigger]);


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const getPages = () => {
    if (page <= 2) return [1, 2, 3];
    return [page - 1, page, page + 1];
  };

  const handleRowSelection = useCallback((rows: Row<RawServiceType>[]) => {
    setSelectedServices(rows);
  }, []);

  return (
    <section className="w-full h-[calc(100vh-100px)] bg-transparent dark:bg-background">
      <div className="absolute left-0 pt-4 pb-2 px-4 w-full flex items-center justify-between bg-background">
        <Typography variant="h1" className="z-30">Serviços</Typography>
        <Input
          className="w-72"
          placeholder="Procurar serviço..."
          onInput={(e) => {
            setServiceSearchValue((e.target as HTMLInputElement).value);
            if (!(e.target as HTMLInputElement).value.length) {
              handleUpdate();
            }
          }}
        />
        <div className="flex gap-2">
          {/* <RemoveServicesDialog services={selectedServices} /> */}
          <AddNewServiceDialog onSubmitSuccess={() => handleUpdate()} />
        </div>
      </div>
      <div className="py-2 px-4 mt-14 flex flex-col gap-2 flex-1 w-full p-2 bg-background rounded-md">
        <DataTable columns={columns} data={services || []} onRowSelection={handleRowSelection} className="bg-background max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]" />
        <Pagination className="m-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={handlePrevious} disabled={page - 1 < 1 || !services?.length}>Anterior</PaginationPrevious>
            </PaginationItem>
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex gap-2 relative"
            >
              <div className={cn("absolute border w-10 h-full rounded-md bg-background", page > 1 && "left-1/2 -translate-x-1/2")} />
              {getPages().map((pageNumber) => (
                <PaginationItem key={pageNumber} className="z-50">
                  <PaginationLink
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={pageNumber > totalPages}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </motion.div>
            <PaginationItem>
              <PaginationNext onClick={handleNext} disabled={page + 1 > totalPages || !services?.length}>Próximo</PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section >
  );
};
