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
    <div className="flex flex-col rounded-md border border-border">
      <h3 className="px-5 py-4">{value}</h3>
      <div className="px-5">
        <Input
          className="body px-5 text-gray"
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
