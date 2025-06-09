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
              className="flex justify-center items-center rounded-lg bg-gray-100 px-2 hover:bg-gray-200 transition h-6 w-6"
              onClick={onEdit}
            >
              <Pencil className="!min-h-3 !min-w-3 text-gray-700" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className='bg-black text-white h-6 flex items-center text-xs p-2 font-inter'>
            <p>Alterar</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex justify-center items-center rounded-lg bg-red-50 p-2 hover:bg-red-100 transition h-6 w-6"
              onClick={onDelete}
            >
              <Trash2 className="!min-h-3 !min-w-3 text-red-600" />
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
