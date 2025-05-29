import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Typography } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { AddNewServiceDialog } from "./AddNewServiceDialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getServices } from "@/services/services";
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
import { EditServiceDialog } from "./EditServiceDialog";
import { useSettings } from "@/hooks/use-settings";
import useWindowSize from "@/hooks/use-window-size";
import { RemoveServicesDialog } from "./RemoveServicesDialog";
import { Separator } from "@/components/ui/separator";


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
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | undefined>(undefined)
  const [selectedRows, setSelectedRows] = useState<{ index: number, id: string }[]>([]);

  const { isMobile } = useWindowSize();

  useEffect(() => {
    console.log(selectedRows)
  }, [selectedRows])

  const columns = useMemo<ColumnDef<RawServiceType>[]>(() => [
    {
      accessorKey: "active",
      header: () => <Typography variant="span" className="!text-neutral-200">Ativo</Typography>,
      cell: ({ row, table, row: { index } }) => (
        <>
          <Typography variant="span" className="!flex !justify-center">
            {row.getValue("active") ? <Check className="text-green-400" /> : <X className="text-red-400" />}
          </Typography>
          <div className="absolute top-2 left-0 flex justify-center !p-0 !h-full w-full -translate-y-[8px]">
            <EditServiceDialog
              service={row.original}
              onSubmitSuccess={() => handleUpdate()}
              onClick={(event) => {
                setSelectedRows((prevSelectedRows) => {
                  if (!prevSelectedRows) return [{ index, id: row.id }];

                  if (event.ctrlKey) {
                    if (prevSelectedRows.some(r => r.id === row.id && r.index === index)) {
                      const newSelected = prevSelectedRows.filter(r => r.id !== row.id || r.index !== index);

                      // Atualiza seleção na tabela
                      const selectionObj = newSelected.reduce((acc, row) => {
                        acc[row.id] = true;
                        return acc;
                      }, {} as Record<string, boolean>);
                      table.setRowSelection(selectionObj);

                      return newSelected;
                    }

                    const newSelected = [...prevSelectedRows, { index, id: row.id }];

                    const selectionObj = newSelected.reduce((acc, row) => {
                      acc[row.id] = true;
                      return acc;
                    }, {} as Record<string, boolean>);
                    table.setRowSelection(selectionObj);

                    return newSelected;
                  }

                  if (event.shiftKey && prevSelectedRows.length > 0) {
                    const indices = prevSelectedRows.map(r => r.index);
                    const min = Math.min(...indices);
                    const max = Math.max(...indices);

                    const start = (() => {
                      if (index >= min && index <= max && direction === 'up') {
                        return index;
                      } else if (index <= min) {
                        setDirection('up');
                        return index;
                      } else if (direction === 'up') {
                        setDirection('down');
                        return max;
                      } else {
                        return min;
                      }
                    })();

                    const end = (() => {
                      if (index >= min && index <= max && direction === 'down') {
                        return index;
                      } else if (index >= max) {
                        setDirection('down');
                        return index;
                      } else if (direction === 'down') {
                        setDirection('up');
                        return min;
                      } else {
                        return max;
                      }
                    })();

                    const allRows = table.getRowModel().rows;

                    const selectedRows = allRows.slice(start, end + 1).map((value, i) => ({ index: start + i, id: value.id }));

                    const selectionObj = selectedRows.reduce((acc, row) => {
                      acc[row.id] = true;
                      return acc;
                    }, {} as Record<string, boolean>);

                    table.setRowSelection(selectionObj);

                    return selectedRows;
                  }

                  if (prevSelectedRows.length === 1 && prevSelectedRows[0].index === index) {
                    table.setRowSelection({});
                    return [];
                  }

                  table.setRowSelection({ [row.id]: true });
                  return [{ index, id: row.id }];
                });
              }}
            />
          </div>
        </>
      ),
    },
    {
      accessorKey: "name",
      header: () => <Typography variant="span" className="!text-neutral-200">Nome do serviço</Typography>,
      cell: ({ row }) => (
        <Typography variant="span" className="md:whitespace-nowrap">
          {row.getValue("name")}
        </Typography>
      ),
    },
    {
      accessorKey: "description",
      header: () => <Typography variant="span" className="!text-neutral-200">Descrição</Typography>,
      cell: ({ row }) => (
        <Typography variant="span" className="min-w-48">{row.getValue("description")}</Typography>
      ),
    },
    {
      accessorKey: "duration_minutes",
      header: () => <Typography variant="span" className="!text-neutral-200">Duração (min)</Typography>,
      cell: ({ row }) => (
        <Typography variant="span" className="!flex !justify-center">
          {row.getValue("duration_minutes")} min
        </Typography>
      ),
    },
    {
      accessorKey: "price",
      header: () => <Typography variant="span" className="!text-neutral-200">Valor (R$)</Typography>,
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
      header: () => <Typography variant="span" className="!text-neutral-200">Presencial</Typography>,
      cell: ({ row }) => (
        <Typography variant="span" className="!flex !justify-center">{row.getValue("allow_in_person") ? <Check className="text-green-400" /> : <X className="text-red-400" />}</Typography>
      ),
    },
    {
      accessorKey: "allow_online",
      header: () => <Typography variant="span" className="!text-neutral-200">Online</Typography>,
      cell: ({ row }) => (
        <Typography variant="span" className="!flex !justify-center">{row.getValue("allow_online") ? <Check className="text-green-400" /> : <X className="text-red-400" />}</Typography>

      ),
    },
  ], [direction, handleUpdate]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      getServices({ name: serviceSearchValue }).then(data => {
        setServices(data?.services);
        setTotalPages(data?.totalPages);
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
    <section className="w-full h-[calc(100vh-120px)] bg-neutral-50 dark:bg-background">
      <div className="p-4 w-full flex items-center justify-end">
        {/* <Typography variant="h1" className="z-30 md:block hidden">Serviços</Typography> */}
        <div className="flex gap-2 items-center">
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
          <Separator orientation="vertical" className="h-4" />
          <AddNewServiceDialog onSubmitSuccess={() => handleUpdate()} />          
          <RemoveServicesDialog services={selectedServices} onSubmitSuccess={() => handleUpdate()} />
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1 w-full bg-background">
        <DataTable columns={columns} data={services || []} onRowSelection={handleRowSelection} className="bg-background md:h-[calc(83vh-8px)] h-[calc(83vh-8px)] rounded-none" />
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
