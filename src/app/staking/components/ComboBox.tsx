"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useVaultContext } from "../context/VaultContext";
import { TOKENS, Token, getVaultType } from "../utils/vaultUtils";

export function ComboBox() {
  const [open, setOpen] = useState(false);
  const { selectedVault, setSelectedVault } = useVaultContext();

  // テスト用
  useEffect(() => {
    getVaultType(selectedVault);
  }, [selectedVault]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-16">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-32 justify-between px-3"
        >
          <div className="flex items-center space-x-2">
            <Image
              src={selectedVault.icon}
              alt={selectedVault.name}
              width={24}
              height={24}
            />
            <p>{selectedVault.name}</p>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {Object.values(TOKENS).map((vault: Token) => (
                <CommandItem
                  key={vault.name}
                  value={vault.name}
                  onSelect={() => {
                    setSelectedVault(vault);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Image
                      src={vault.icon}
                      alt={vault.name}
                      width={24}
                      height={24}
                    />
                    <p>{vault.name}</p>
                  </div>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedVault === vault ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
