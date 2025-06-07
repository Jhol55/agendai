import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Typography } from "./typography";
import useWindowSize from "@/hooks/use-window-size";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  className
}: {
  onChange?: (file: File | null) => void;
  className?: string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isMobile } = useWindowSize();

  const handleFileChange = (newFile: File | null) => {
    if (newFile) {
      setFile(newFile);
      onChange?.(newFile);
    }
  };

  const handleRemoveFile = () => {
    onChange?.(null);
    handleFileChange(null);
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (files) => {
      handleFileChange(files[0] || null)
    },
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <AnimatePresence>
      <div
        className={cn("flex flex-col justify-center flex-1", className)}
      >
        <div className="w-full flex mx-auto flex-1" {...getRootProps()}>
          <motion.div
            onClick={!file ? handleClick : undefined}
            whileHover="animate"
            className={cn(
              !file
                ? "cursor-pointer border rounded-md border-neutral-200 dark:border-neutral-800"
                : "cursor-auto", "flex justify-center align-center flex-1 group/file rounded-lgr w-full overflow-hidden"
            )}
          >
            <input
              ref={fileInputRef}
              id="file-upload-handle"
              type="file"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            {file && (
              <motion.div
                layout
                initial={{ right: 0, scale: 0, opacity: 0 }}
                animate={{ left: "-0.75rem", scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 35,
                  duration: 0.4,
                  ease: "easeInOut"
                }}
                className="absolute z-50 -top-3"
              >
                <Button
                  className="!p-1 h-6 w-6 border rounded-full"
                  variant="destructive"
                  onClick={handleRemoveFile}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
            <div
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="relative w-full">
                {file &&
                  <motion.div
                    layoutId="file-upload"
                    className={cn(
                      "relative overflow-hidden z-40 bg-white dark:bg-neutral-800 flex flex-col items-start justify-start md:h-24 p-4 w-full mx-auto",
                      "shadow-sm border rounded-md border-neutral-200 dark:border-neutral-800"
                    )}
                  >
                    <div className="flex justify-between w-full items-center gap-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="truncate max-w-xs"
                      >
                        <Typography variant="span">
                          {file.name}
                        </Typography>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit flex-shrink-0 dark:bg-neutral-800 shadow-input"
                      >
                        <Typography variant="span">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </motion.div>
                    </div>
                    <div className="flex md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                      >
                        <Typography variant="p">
                          {file.type}
                        </Typography>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                      >
                        <Typography variant="p" secondary>
                          Data de modificação:{" "}
                          {new Date(file.lastModified).toLocaleDateString()}
                        </Typography>
                      </motion.div>
                    </div>
                  </motion.div>
                }
                {!file && (
                  <motion.div
                    layoutId="file-upload"
                    variants={mainVariant}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={cn(
                      "relative z-40 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center h-32 w-[8rem] max-w-[8rem] mx-auto rounded-md",
                      ""
                    )}
                  >
                    {isDragActive ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <Typography variant="span">
                          Solte
                        </Typography>
                        <IconUpload className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <IconUpload className="h-4 w-4" />
                    )}
                  </motion.div>
                )}
                {!file && (
                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border border-dashed border-skyblue inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-[8rem] mx-auto rounded-md"
                  ></motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${index % 2 === 0
                ? "bg-gray-50 dark:bg-neutral-950"
                : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                }`}
            />
          );
        })
      )}
    </div>
  );
}
