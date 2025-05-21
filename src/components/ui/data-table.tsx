"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  makeStateUpdater,
  Row,
  RowSelection,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Loading } from "./loading/loading"
import { motion } from "framer-motion"
import { Typography } from "./typography"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowSelection?: (selectedRows: Row<TData>[]) => void;
  onChange?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelection,
  onChange,
  className,
  style
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    }
  })

  useEffect(() => {
    onRowSelection?.(table.getFilteredSelectedRowModel().rows);
  }, [onRowSelection, rowSelection, table])


  // useEffect(() => {
  //   onChange?.()
  //   setRowSelection(() => {
  //     const selectedRows = table.getFilteredSelectedRowModel().rows as Row<TData>[] & { original: TData & { id: number } }[];
  //     const newSelectedRows: { original: { id: number } }[] = []
  //     if (!selectedRows?.length) return {}
  //     data.map((id, index) => {
  //       if (selectedRows[index]?.original.id === id) {
  //         newSelectedRows.push(selectedRows[index])
  //       }
  //     })
  //     return newSelectedRows
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data])

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 5000)

    if (data.length) {
      setTimeout(() => {
        setIsLoading(false);
      }, 700)
    }
  }, [data])

  return (
    <div className={cn("flex rounded-md border border-neutral-200 dark:border-neutral-800")}>
      <div className={cn("relative w-full h-full overflow-auto rounded-md", className)} style={style}>
        <Table>
          <TableHeader className="sticky top-0 z-50 bg-neutral-700 dark:bg-neutral-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(data?.length && !isLoading) && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <motion.div
                    className={cn(isLoading && "absolute", "w-max text-center inline-block")}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                      opacity: isLoading ? 0 : 1,
                      scaleX: isLoading ? 0 : 1
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    <Typography variant="span">
                      Não há informações para exibir.
                    </Typography>
                  </motion.div>
                  <div className="w-full flex justify-center">
                    <Loading display={isLoading} className="!scale-[0.5]" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
