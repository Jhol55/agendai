"use client";
import React, { useEffect, useRef, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import {
  IconX,
  IconTrash,
  IconPlus
} from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { convertToBase64 } from "@/utils/convert-to-base64";
import { deleteDocuments, getDocuments, uploadDocuments } from "@/services/documents";
import { Document } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import useWindowSize from "@/hooks/use-window-size";
import { useSettings } from "@/hooks/use-settings";


export const columns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          (table && table.getIsAllPageRowsSelected()) ||
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
    cell: ({ row }) => <Typography variant="span">{row.getValue("id")}</Typography>
  },
  {
    accessorKey: "filename",
    header: "Nome do arquivo",
    cell: ({ row }) => <Typography variant="span" className="md:whitespace-nowrap">{row.getValue("filename")}</Typography>
  },
  {
    accessorKey: "summary",
    header: "Resumo",
    cell: ({ row }) => <Typography variant="span">{row.getValue("summary")}</Typography>
  },
  {
    accessorKey: "size",
    header: "Tamanho",
    cell: ({ row }) => <Typography variant="span" className="md:whitespace-nowrap">{`${(parseFloat(row.getValue("size")) / 1024 / 1024).toFixed(2)} MB`}</Typography>
  },
]


export const KnowledgeBases = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Row<Document>[]>([])

  const [showFileUpload, setShowFileUpload] = useState(false); //MUDAR PARA SHOWDOCUMENTUPLOAD
  const [file, setFile] = useState<File | null>(null); //

  const { isMobile } = useWindowSize();

  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => {
    setShowFileUpload(false);
    setFile(null);
  });

  const handleFileUpload = (file: File | null) => {
    setFile(file);
  };

  const handleSubmitFile = async () => {
    if (!file) {
      alert("Por favor, selecione um arquivo antes de enviar.");
      return;
    }

    const formData = new FormData();
    const base64File = await convertToBase64(file);
    formData.append("files", base64File);
    formData.append("categories", "knowledge");
    formData.append("fileNames", file.name);
    formData.append("fileTypes", file.type);
    formData.append("fileSizes", file.size.toString());

    setShowFileUpload(false);
    setFile(null);

    uploadDocuments({ data: formData }).then((data) => {
      if (data?.message == "success") {
        getDocuments({}).then((data) => {
          setDocuments(data[0]?.filename ? data : []);
          toast.success("Arquivos enviados com sucesso!", {
            description: "Bases de conhecimento atualizadas."
          });
        });
      } else {
        toast.error("Erro ao enviar arquivos!", {
          description: "Por favor, tente novamente mais tarde."
        });
      }
    })
  };


  const handleDeleteFiles = () => {
    const formData = new FormData();

    const filenames = selectedDocuments.map(selectedDocument => selectedDocument.original.filename);
    formData.append("files", JSON.stringify(filenames));

    deleteDocuments({ data: formData }).then((data) => {
      if (data?.success) {
        getDocuments({}).then((data) => {
          setDocuments(data[0]?.filename ? data : []);
          toast.success("Arquivos deletados com sucesso!", {
            description: "Bases de conhecimento atualizadas."
          });
        })
      } else {
        toast.error("Erro ao deletar arquivos!", {
          description: "Por favor, tente novamente mais tarde."
        });
      }
    })
  }

  useEffect(() => {
    getDocuments({}).then((data) => {
      if (!data?.length) return;
      setDocuments(data[0]?.filename ? data : []);
    });
  }, []);

  return (
    <>
      <section className="absolute flex flex-col w-full h-full">
        <div className="sticky top-0 flex flex-col gap-4 bg-transparent dark:bg-neutral-900 z-50">
          <div className="flex items-center justify-between md:mt-10 mt-2 px-10">
            <Typography variant="h1" className="whitespace-nowrap text-end">Bases de Conhecimento</Typography>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!selectedDocuments.length}
                    variant="destructive"
                    className="py-2 px-2 h-8"
                  >
                    <IconTrash className="h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[90vw] md:w-full rounded-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle asChild>
                      <Typography
                        variant="h2"
                      >
                        Tem certeza que deseja continuar?
                      </Typography>
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <Typography
                        variant="span"
                        secondary
                      >
                        Esta ação não pode ser desfeita. Isso removerá permanentemente os arquivos selecionados.
                      </Typography>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteFiles}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                className="py-2 px-2 h-8"
                onClick={() => setShowFileUpload(true)}
              >
                <IconPlus className="h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="py-2 px-10 flex flex-col gap-2 flex-1 w-full">
          <DataTable
            columns={columns}
            data={documents}
            onRowSelection={(data) => setSelectedDocuments(data)}

          />
        </div>
      </section>
      <AnimatePresence>
        {showFileUpload &&
          <motion.section
            ref={ref}
            initial={isMobile ? { y: "-100%", opacity: 0 } : { x: "100%", opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%", transitionEnd: { opacity: 0 } } : { x: "100%", transitionEnd: { opacity: 0 } }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed flex flex-col px-10 right-0 w-full md:max-w-md mx-auto min-h-screen border-l",
              "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 z-50",
              file ? "pl-12 pr-10" : "px-10"
            )}
          >
            <div className="flex justify-end align-start py-2">
              {!file &&
                <div className="w-full flex flex-col gap-2 mb-4 mt-2 md:mt-10">
                  <Typography variant="h3">
                    Carregar arquivo
                  </Typography>
                  <Typography variant="span" secondary>
                    Arraste e solte seu arquivo aqui ou clique para carregar um arquivo
                  </Typography>
                </div>
              }
              <Button
                variant="ghost"
                className="flex justify-end align-start px-2.5"
                onClick={() => {
                  setShowFileUpload(false);
                  setFile(null);
                }}
              >
                <IconX className="!h-5 !w-5" />
              </Button>
            </div>
            <motion.div
              layout
              initial={{ flex: file ? 0 : 1 }}
              animate={{ flex: file ? 0 : 1 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className={cn(
                "relative flex flex-col align-center mb-4 bg-white dark:bg-neutral-900"
              )}
            >
              <FileUpload onChange={handleFileUpload} />
            </motion.div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={file ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              exit={{ y: "100%", transitionEnd: { opacity: 0 } }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="flex justify-between mb-20"
            >
              <Button
                onClick={handleSubmitFile}
              >
                Enviar arquivo
              </Button>
            </motion.div>
          </motion.section>}
      </AnimatePresence>
    </>
  )
}