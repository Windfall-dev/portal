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
import { VAULT_CONFIGS, VaultConfig, getVaultType } from "../utils/vaultUtils";

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
              src={selectedVault.logo}
              alt={selectedVault.vaultName}
              width={24}
              height={24}
            />
            <p>{selectedVault.vaultName}</p>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {Object.values(VAULT_CONFIGS).map((vault: VaultConfig) => (
                <CommandItem
                  key={vault.vaultName}
                  value={vault.vaultName}
                  onSelect={(currentValue) => {
                    setSelectedVault(
                      VAULT_CONFIGS[currentValue] === selectedVault
                        ? VAULT_CONFIGS["SOL"]
                        : VAULT_CONFIGS[currentValue],
                    );
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Image
                      src={vault.logo}
                      alt={vault.vaultName}
                      width={24}
                      height={24}
                    />
                    <p>{vault.vaultName}</p>
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
