import { AvatarImage } from "@radix-ui/react-avatar";
import React from "react";

import SectionTitle from "@/components/SectionTitle";
import { Avatar } from "@/components/ui/avatar";

// import { Button } from "@/components/ui/button";
import users from "../app/mock_users.json";

function Ranker() {
  return (
    <div className="pb-[60px] pt-5">
      <SectionTitle title="Top Ranker" />
      <div className="flex flex-col">
        <div className="mb-3 space-y-3">
          {users.map((user, index) => (
            <RankingUser
              key={index}
              ranking={user.rank}
              name={user.name}
              points={user.points}
            />
          ))}
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

interface RankingUserProps {
  ranking: string;
  name: string;
  points: string;
}

function RankingUser({ ranking, name, points }: RankingUserProps) {
  return (
    <div className="flex h-[32px] flex-row justify-between px-5">
      <div className="flex flex-1 items-center space-x-[6px]">
        <h4>{ranking}</h4>
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
