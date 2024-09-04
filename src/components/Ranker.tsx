"use client";

import { AvatarImage } from "@radix-ui/react-avatar";
import React, { useEffect, useState } from "react";

import SectionTitle from "@/components/SectionTitle";
import { Avatar } from "@/components/ui/avatar";

// import { Button } from "@/components/ui/button";
// import users from "../app/mock_users.json";

interface RankingUserProps {
  rank: string;
  name: string;
  points: string;
}

function Ranker() {
  const [users, setUsers] = useState<RankingUserProps[]>([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/rankings`,
          {
            method: "GET",
          },
        );
        const data = await response.json();
        setUsers(data.rankings);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="pb-[60px] pt-5">
      <SectionTitle title="Top Ranker" />
      <div className="flex flex-col">
        <div className="mb-3 space-y-3">
          {users.length > 0 ? (
            users.map((user, index) => (
              <RankingUser
                key={index}
                rank={user.rank}
                name={user.name}
                points={user.points}
              />
            ))
          ) : (
            <div className="space-y-[10px] text-center">
              <h3>ーNO DATAー</h3>
            </div>
          )}
        </div>
        {/* <div className="flex justify-center">
          <Button size="S" className="w-[114px]">
            <p className="text-body2_bold">View More &gt;</p>
          </Button>
        </div> */}
      </div>
    </div>
  );
}

function RankingUser({ rank, name, points }: RankingUserProps) {
  return (
    <div className="flex h-[32px] flex-row justify-between px-5">
      <div className="flex flex-1 items-center space-x-[6px]">
        <h4>{rank}</h4>
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/big-smile/svg?seed=${name}`}
            alt="avatar"
          />
        </Avatar>
        <div className="text-body-bold">{name}</div>
      </div>
      <div className="flex items-center">
        <div className="text-body-bold">{points}</div>
        <div className="text-body-bold text-wf-orange">pt</div>
      </div>
    </div>
  );
}

export default Ranker;
