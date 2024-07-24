import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StakingPage: React.FC = () => {
  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Staking</h1>
      <Card>
        <CardHeader>
          <CardTitle>Staking Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="bg-gray-100 p-2 rounded">TVL</div>
          <div className="bg-gray-100 p-2 rounded">利息</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Staking</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deposit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit" className="mt-4">
              <div className="space-y-4">
                <Input type="number" placeholder="Enter amount to deposit" />
                <Button className="w-full">Deposit</Button>
              </div>
            </TabsContent>
            <TabsContent value="withdraw" className="mt-4">
              <div className="space-y-4">
                <Input type="number" placeholder="Enter amount to withdraw" />
                <Button className="w-full">Withdraw</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default StakingPage;
