import Link from "next/link";
import React from "react";
import { LuPlay } from "react-icons/lu";

import { Button } from "@/components/ui/button";

const HomePage: React.FC = () => (
  <main className="flex-grow overflow-y-auto">
    <div className="p-4 bg-gray-300">
      <h2 className="text-xl font-bold text-center mb-2">サービス説明</h2>
      <p className="text-sm text-gray-600 text-center mb-4">KV、簡単説明</p>

      <div className="bg-gray-400 p-4 mt-4">
        <h3 className="text-lg font-semibold text-center mb-2">Staking 関連</h3>
        <p className="text-sm text-center">説明、情報</p>
      </div>
    </div>

    <div className="p-4 bg-gray-200">
      <h3 className="text-lg font-semibold text-center mb-2">おすすめゲーム</h3>
      <p className="text-sm text-gray-600 text-center mb-4">ゲームリスト</p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="flex flex-col items-center">
              <Link
                href="/game"
                className="bg-gray-100 aspect-square w-full mb-2"
              />
              <Button size="sm" className="w-full">
                <LuPlay className="mr-2 h-4 w-4" /> Play
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-400 p-4 mt-4">
        <h3 className="text-lg font-semibold text-center mb-2">ランキング</h3>
        {/* Add ranking content here */}
      </div>
    </div>

    <div className="p-4 bg-gray-300">
      <h2 className="text-lg font-semibold text-center mb-2">サービス説明2</h2>
      <p className="text-sm text-center">もっと説明</p>
    </div>
  </main>
);

export default HomePage;
