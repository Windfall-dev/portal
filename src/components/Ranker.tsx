import { AvatarImage } from "@radix-ui/react-avatar";
import React from "react";

import SectionTitle from "@/components/SectionTitle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import users from "../app/mock_users.json";

function Ranker() {
  return (
    <div className="pt-5 pb-[60px]">
      <SectionTitle title="Top Ranker" />
      <div className="flex flex-col">
        <div className="space-y-3 mb-3">
          {users.map((user, index) => (
            <RankingUser
              key={index}
              ranking={user.rank}
              avatar={user.avatar}
              name={user.name}
              points={user.points}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Button size="S" className="w-[114px]">
            <p className="body2_bold">View More &gt;</p>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RankingUserProps {
  ranking: string;
  avatar: string;
  name: string;
  points: string;
}

function RankingUser({ ranking, avatar, name, points }: RankingUserProps) {
  return (
    <div className="flex flex-row px-5 h-[32px] justify-between">
      <div className="flex flex-1 items-center space-x-[6px]">
        <h4>{ranking}</h4>
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar} alt="avatar" />
        </Avatar>
        <div className="body-bold">{name}</div>
      </div>
      <div className="flex items-center">
        <div className="body-bold">{points}</div>
        <div className="body-bold text-wf-orange">pt</div>
      </div>
    </div>
  );
}

export default Ranker;
