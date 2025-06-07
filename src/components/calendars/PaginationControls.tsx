// components/PaginationControls.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils'; // Certifique-se de que o caminho está correto

interface PaginationControlsProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
<<<<<<< HEAD
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[rgb(0,0,0,0.2)] rounded-lg">
      <div className="text-sm text-neutral-600 dark:text-neutral-200">
=======
    <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg">
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
>>>>>>> fb12602a76ab2764a3d684e0e69f39f6c3ce6cf0
        Exibindo {startItem} - {endItem} de {totalItems} items
      </div>
      <div className="flex items-center space-x-2">
        {/* Ir para o Início */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          className={cn(
<<<<<<< HEAD
            "p-1 rounded-md text-neutral-500 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
=======
            "p-1 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
>>>>>>> fb12602a76ab2764a3d684e0e69f39f6c3ce6cf0
            !canGoPrev && "pointer-events-none"
          )}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Página Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className={cn(
<<<<<<< HEAD
            "p-1 rounded-md text-neutral-500 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
=======
            "p-1 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
>>>>>>> fb12602a76ab2764a3d684e0e69f39f6c3ce6cf0
            !canGoPrev && "pointer-events-none"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Número da Página Atual */}
        <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md text-sm font-medium">
          {currentPage}
        </span>
<<<<<<< HEAD
        <span className="text-sm text-neutral-600 dark:text-neutral-200">
=======
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
>>>>>>> fb12602a76ab2764a3d684e0e69f39f6c3ce6cf0
          de {totalPages} páginas
        </span>

        {/* Próxima Página */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={cn(
<<<<<<< HEAD
            "p-1 rounded-md text-neutral-500 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
=======
            "p-1 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
>>>>>>> fb12602a76ab2764a3d684e0e69f39f6c3ce6cf0
            !canGoNext && "pointer-events-none"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Ir para o Fim */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className={cn(
<<<<<<< HEAD
            "p-1 rounded-md text-neutral-500 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
=======
            "p-1 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed",
>>>>>>> fb12602a76ab2764a3d684e0e69f39f6c3ce6cf0
            !canGoNext && "pointer-events-none"
          )}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};