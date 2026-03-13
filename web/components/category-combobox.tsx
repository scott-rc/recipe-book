import { useFindMany } from "@gadgetinc/react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { api } from "../api";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface CategoryComboboxProps {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [{ data: categories, fetching }] = useFindMany(api.category, {
    select: { id: true, name: true },
    sort: { name: "Ascending" },
  });

  const selectedCategory = categories?.find((c) => c.id === value);
  const trimmedSearch = search.trim();
  const hasExactMatch = categories?.some((c) => c.name.toLowerCase() === trimmedSearch.toLowerCase());

  const handleCreate = async () => {
    if (!trimmedSearch) {
      return;
    }
    const created = await api.category.create({ name: trimmedSearch });
    onChange(created.id);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedCategory ? selectedCategory.name : "Select category..."}
          <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search categories..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>{fetching ? "Loading..." : "No categories found."}</CommandEmpty>
            {value && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <XIcon className="text-muted-foreground size-4" />
                  Clear
                </CommandItem>
              </CommandGroup>
            )}
            {categories && categories.length > 0 && (
              <CommandGroup heading="Categories">
                {categories
                  .filter((c) => !trimmedSearch || c.name.toLowerCase().includes(trimmedSearch.toLowerCase()))
                  .map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => {
                        onChange(category.id === value ? null : category.id);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon className={cn("size-4", value === category.id ? "opacity-100" : "opacity-0")} />
                      {category.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
            {trimmedSearch && !hasExactMatch && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleCreate}>Create &quot;{trimmedSearch}&quot;</CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
