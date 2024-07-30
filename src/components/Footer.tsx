"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { LuGamepad2, LuHome, LuWallet } from "react-icons/lu";

import { useTelegram } from "@/hooks/useTelegram";

export function Footer() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", icon: LuHome, path: "/" },
    {
      name: "Game",
      icon: LuGamepad2,
      path: "/game",
    },
    {
      name: "Staking",
      icon: LuWallet,
      path: "/staking",
    },
  ];

  return (
    <footer className="bg-gray-800 text-white p-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center ${
                isActive ? "text-yellow-400" : "text-white"
              }`}
            >
              <div className="mb-1">
                <item.icon size={24} />
              </div>
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
