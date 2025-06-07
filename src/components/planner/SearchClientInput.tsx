import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Loading } from "../ui/loading/loading";
import { useEffect, useRef, useState } from "react";
import { getClients } from "@/services/clients";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react";

export const SearchClientInput = ({ onSelect }: { onSelect?: (client: { id: string, name: string }) => void }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [clients, setClients] = useState<{ id: string, name: string }[]>([]);
  const [clientSearchValue, setClientSearchValue] = useState("");
  const [isClientSearching, setIsClientSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (clientSearchValue) {
      setIsClientSearching(true);
      const timeoutId = setTimeout(async () => {
        return getClients({ name: clientSearchValue }).then(data => {
          setClients(data[0].id ? data : []);
          setIsClientSearching(false);
        })
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSearchValue]);

  return (
    <Popover
      open={!!(clientSearchValue && isOpened)}
      onOpenChange={setIsOpened}
      modal
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={!!(clientSearchValue && isOpened)}
          className="md:w-72 w-56 flex justify-between relative border-none"
        >
          <div className="absolute left-0 flex items-center w-full border border-neutral-400/30 dark:border-neutral-700/60 bg-neutral-200 hover:bg-neutral-200 rounded-md dark:!bg-neutral-900">
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50 dark:text-neutral-200 text-neutral-700" />
            <Input
              ref={inputRef}
              placeholder="Procurar um cliente..."
              className="w-full border-none z-50 rounded-md !bg-transparent"
              onInput={(e) => setClientSearchValue((e.target as HTMLInputElement).value)}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 popover-content-width-fix"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList className={cn(!clientSearchValue && "hidden")}>
            <div className="flex justify-center items-center">
              <Loading display={isClientSearching} className="!scale-[0.3]" />
              {!isClientSearching && !clients.length &&
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              }
            </div>
            <CommandGroup>
              {!isClientSearching && clients?.map((client, index) => (
                <CommandItem
                  key={`${client.id}-${index}`}
                  value={client.name}
                  onSelect={() => {
                    setIsOpened(false);
                    setClientSearchValue("");
                    onSelect?.(client);
                    if (inputRef.current) {
                      inputRef.current.value = ""
                    }
                  }}
                  className="cursor-pointer"
                >
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}