import React from "react";

import { AlertDialogDemo } from "@/components/AlertDialog";
import { InfoDouble } from "@/components/Info";
import SectionTitle from "@/components/SectionTitle";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function StakingPage() {
  return (
    <main className="space-y-10">
      <div>
        <SectionTitle title="Staking" />
        <InfoDouble />
      </div>
      <div>
        <Tabs defaultValue="deposit" className="px-5 mb-10">
          <TabsList className="flex w-full  bg-border p-1.5 h-11">
            <TabsTrigger value="deposit" className="rounded-s w-full">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="rounded-s w-full">
              Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="">
            <TabCard value="Deposit" />
          </TabsContent>
          <TabsContent value="withdraw" className="">
            <TabCard value="Withdraw" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

interface TabCardProps {
  value: string;
}

function TabCard({ value }: TabCardProps) {
  return (
    <div className="flex flex-col border border-border rounded-md">
      <h3 className="px-5 py-4">{value}</h3>
      <div className="px-5">
        <Input
          className="px-5 text-gray body"
          type="number"
          placeholder={`Enter amount to ${value.toLowerCase()}`}
        />
      </div>
      <div className="p-5">
        <AlertDialogDemo ButtonText={value} />
      </div>
    </div>
  );
}

export default StakingPage;
