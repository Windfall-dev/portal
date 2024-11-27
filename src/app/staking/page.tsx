"use client";

import React from "react";

import SectionTitle from "@/components/SectionTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StakingInfo } from "./components/StakingInfo";
import { StakingTabCard } from "./components/StakingTabCards";

function StakingPage() {
  return (
    <main className="space-y-10 overflow-y-auto">
      <div>
        <SectionTitle title="Deposit" />
        <div className="px-5">
          <StakingInfo />
        </div>
      </div>
      <div>
        <Tabs defaultValue="deposit" className="mb-10 px-5">
          <TabsList className="flex h-11 w-full bg-border p-1.5">
            <TabsTrigger value="deposit" className="w-full rounded-s">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="w-full rounded-s">
              Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="">
            <StakingTabCard actionType="deposit" />
          </TabsContent>
          <TabsContent value="withdraw" className="">
            <StakingTabCard actionType="withdraw" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default StakingPage;
