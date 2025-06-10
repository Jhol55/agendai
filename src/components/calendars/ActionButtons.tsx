'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Pencil, Trash2 } from 'lucide-react'

export function ActionButtons({ onEdit, onDelete }: { onEdit?: () => void, onDelete?: () => void }) {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex justify-center items-center rounded-lg bg-gray-100 dark:bg-[rgb(105,110,119,0.1)] px-2 hover:bg-gray-200 dark:hover:bg-[rgb(105,110,119,0.2)] transition h-6 w-6"
              onClick={onEdit}
            >
              <Pencil className="!min-h-3 !min-w-3 text-gray-700 dark:text-neutral-300" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className='bg-black text-white h-6 flex items-center text-xs p-2 font-inter'>
            <p>Alterar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex justify-center items-center rounded-lg bg-red-50 dark:bg-[rgb(229,70,102,0.1)] p-2 hover:bg-red-100 dark:hover:bg-[rgb(229,70,102,0.2)] transition h-6 w-6"
              onClick={onDelete}
            >
              <Trash2 className="!min-h-3 !min-w-3 text-red-600 dark:text-red-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className='bg-black text-white h-6 flex items-center text-xs p-2 font-inter'>
            <p>Excluir</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
