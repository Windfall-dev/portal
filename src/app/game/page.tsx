import Link from "next/link";
import React from "react";
import { LuInfo, LuTrophy } from "react-icons/lu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const GamePage: React.FC = () => (
  <main className="max-w-2xl mx-auto p-4 space-y-6">
    <h1 className="text-2xl font-bold mb-4">ゲーム情報</h1>

    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">タイトル名</h3>
          <p className="text-xl font-bold">[Game Title]</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">サムネイル</h3>
          <div className="bg-gray-100 aspect-video w-full rounded-lg"></div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">説明文</h3>
          <p className="text-gray-600">[Game Description]</p>
        </div>

        <Separator />

        <div>
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <LuTrophy className="mr-2" />
            ランキング
          </h3>
          <div className="flex space-x-2">
            <Badge variant="secondary">Rank #1</Badge>
            <Badge variant="secondary">Top 10%</Badge>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <LuInfo className="mr-2" />
            詳細情報
          </h3>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>プレイ時間: 30分</li>
            <li>ジャンル: アクション</li>
            <li>難易度: 中級</li>
          </ul>
        </div>

        <Separator />

        <Link href="game/play" className="w-full">
          <Button className="w-full">Play</Button>
        </Link>
      </CardContent>
    </Card>
  </main>
);

export default GamePage;
