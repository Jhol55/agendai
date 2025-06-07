// components/calendars/ServiceListTable.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext, Path } from 'react-hook-form';
import { Typography } from '../ui/typography';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import { AddCalendarProps } from './models/AddCalendar';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { FormMessage } from '../ui/form';

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  allow_online: boolean;
  allow_in_person: boolean;
  description: string;
}

interface ServiceListTableProps {
  services: Service[];
  fieldName: Path<AddCalendarProps>;
}

export const ServiceListTable: React.FC<ServiceListTableProps> = ({ services, fieldName }) => {
  const { watch, setValue } = useFormContext<AddCalendarProps>();

  const [expandedServiceIds, setExpandedServiceIds] = useState<Set<string>>(new Set());

  // selectedServiceIds é um array de objetos { id: string }
  const selectedServiceIds = useMemo(() => {
    return (watch(fieldName) as { id: string }[] || []);
  }, [watch, fieldName]);

  const handleServiceToggle = useCallback((serviceId: string, isChecked: boolean) => {
    // Primeiro, obtenha um array de *apenas os IDs em string* dos serviços já selecionados
    const currentIdsAsStrings = selectedServiceIds.map(item => item.id);

    let updatedIdsAsStrings: string[];

    if (isChecked) {
      updatedIdsAsStrings = [...new Set([...currentIdsAsStrings, serviceId])];
    } else {
      updatedIdsAsStrings = currentIdsAsStrings.filter(id => id !== serviceId);
    }

    const servicesAsObjects = updatedIdsAsStrings.map(id => ({ id }));

    setValue(fieldName, servicesAsObjects);
  }, [selectedServiceIds, setValue, fieldName]); // selectedServiceIds agora é uma dependência que funciona corretamente

  const handleToggleExpand = useCallback((serviceId: string) => {
    setExpandedServiceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg overflow-hidden w-full">
        {/* Table Header */}
        <div className="grid grid-cols-10 p-4">
          <div className="col-span-1"></div>
          <Typography variant='span' className="col-span-3 text-md !text-neutral-700 dark:!text-neutral-100">Serviço</Typography>
          <Typography variant='span' className="col-span-1 text-md text-center !text-neutral-700 dark:!text-neutral-100">Online</Typography>
          <Typography variant='span' className="col-span-1 text-md text-center !text-neutral-700 dark:!text-neutral-100">Presencial</Typography>
          <Typography variant='span' className="col-span-2 text-md text-center !text-neutral-700 dark:!text-neutral-100">Valor</Typography>
          <Typography variant='span' className="col-span-1 text-md text-center !text-neutral-700 dark:!text-neutral-100">Duração</Typography>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {services.length === 0 ? (
          <div className="p-4 text-center text-neutral-700 dark:text-neutral-200">
            Nenhum serviço encontrado.
          </div>
        ) : (
          services.map((service, index) => {
            const isExpanded = expandedServiceIds.has(service.id);
            return (
              <React.Fragment key={service.id}>
                <div
                  className={cn(
                    "grid grid-cols-10 p-4 items-center text-sm rounded-lg border bg-[rgb(253,253,253)] dark:bg-[rgb(0,0,0,0.2)] shadow-sm mb-2",
                    isExpanded && "rounded-b-none border-b-0"
                  )}
                >
                  <div className="col-span-1">
                    <Checkbox
                      checked={selectedServiceIds.some(item => item.id === service.id)} // <-- AQUI ESTÁ A MUDANÇA
                      onCheckedChange={(checked: boolean) =>
                        handleServiceToggle(service.id, checked)
                      }
                    />
                  </div>
                  <div className="col-span-3 text-neutral-700 dark:text-neutral-200 truncate font-medium">{service.name}</div>
                  {/* Colunas Online e Presencial na linha principal */}
                  <div className="col-span-1 flex justify-center">
                    {service.allow_online ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {service.allow_in_person ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <Typography variant='span' className="col-span-2 !text-neutral-700 dark:!text-neutral-200 truncate text-center">R$ {Number(service.price).toFixed(2).replace('.', ',')}</Typography>
                  <Typography variant='span' className="col-span-1 !text-neutral-700 dark:!text-neutral-200 truncate text-center">{service.duration_minutes} min</Typography>
                  <div className="col-span-1 flex justify-end pr-2">
                    <button
                      type='button'
                      onClick={() => handleToggleExpand(service.id)}
                      className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      aria-expanded={isExpanded}
                      aria-controls={`service-description-${service.id}`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-neutral-500 dark:text-neutral-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-500 dark:text-neutral-200" />
                      )}
                    </button>
                  </div>
                </div>

                <div
                  id={`service-description-${service.id}`}
                  className={cn(
                    "ml-[calc(theme(spacing.4)+1.5rem)] mr-4 p-4 mt-[-8px] mb-2 bg-neutral-50 dark:bg-neutral-800 rounded-b-lg border border-t-0 shadow-inner text-neutral-700 dark:text-neutral-300",
                    "transition-all duration-300 overflow-hidden",
                    !isExpanded && "hidden"
                  )}
                >
                  <Typography variant="span" className="font-semibold !text-neutral-800 dark:text-neutral-200 block mb-2">Descrição:</Typography>

                  <Typography variant="p" className="text-sm !text-neutral-700 dark:!text-neutral-400">
                    {service.description}
                  </Typography>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
};