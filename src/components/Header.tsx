"use client";

import React from "react";

import { Button } from "@/components/ui/button";

export const Header: React.FC = () => {
  return (
    <div className="bg-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Windfall</h1>
      <Button>Create Wallet</Button>
    </div>
  );
};
