"use client";

import React, { useState } from "react";

import { AlertDialogs } from "@/components/AlertDialogs";
import { InfoDouble } from "@/components/Info";
import SectionTitle from "@/components/SectionTitle";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function StakingPage() {
  return (
    <main className="space-y-10 overflow-y-auto">
      <div>
        <SectionTitle title="Staking" />
        <div className="px-5">
          <InfoDouble
            text1a="Total Value Locked"
            text1b="10,000,000"
            image1="/icon_dollar.png"
            alt1="Dollar"
            text2a="Prize Pool"
            text2b="50,000.000"
            image2="/icon_dollar.png"
            alt2="Dollar"
          />
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
            <TabCard actionType="deposit" />
          </TabsContent>
          <TabsContent value="withdraw" className="">
            <TabCard actionType="withdraw" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

interface TabCardProps {
  actionType: "deposit" | "withdraw";
}

function TabCard({ actionType }: TabCardProps) {
  const [amount, setAmount] = useState("");

  return (
    <div className="flex flex-col rounded-md border border-border">
      <h3 className="px-5 py-4 capitalize">{actionType}</h3>
      <div className="px-5">
        <Input
          className="body px-5 text-gray"
          placeholder={`Enter amount to ${actionType}`}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="p-5">
        <AlertDialogs actionType={actionType} amount={amount} />
      </div>
    </div>
  );
}

export default StakingPage;
