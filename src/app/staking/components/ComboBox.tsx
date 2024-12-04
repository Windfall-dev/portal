"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

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
import { VAULT_CONFIGS, VaultConfig } from "../utils/vaultUtils";

export function ComboBox() {
  const [open, setOpen] = React.useState(false);
  const { selectedVault, setSelectedVault } = useVaultContext();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedVault}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {Object.values(VAULT_CONFIGS).map((vault: VaultConfig) => (
                <CommandItem
                  key={vault.vaultName}
                  value={vault.vaultName}
                  onSelect={(currentValue) => {
                    setSelectedVault(
                      currentValue === selectedVault ? "" : currentValue,
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedVault === vault.vaultName
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {vault.vaultName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
