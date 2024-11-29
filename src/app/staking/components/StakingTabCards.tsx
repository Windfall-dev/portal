import { useState } from "react";

import { Popup } from "./Popup";

interface TabCardProps {
  actionType: "deposit" | "withdraw";
}

export function StakingTabCard({ actionType }: TabCardProps) {
  const [amount, setAmount] = useState("");

  return (
    <div className="flex flex-col rounded-md border border-border">
      <h3 className="px-5 py-4 capitalize">{actionType}</h3>
      <div className="px-5">
        <div className="flex items-center rounded-lg border-2 px-3 focus-within:border-[#FF9100] focus-within:ring-[#FF9100]">
          <input
            id="amount-input"
            className={`body h-9 w-full border-0 px-0 py-0 ${
              amount ? "text-black" : "text-gray"
            } focus:text-black focus:outline-none`}
            placeholder={`Enter amount to ${actionType}`}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex flex-shrink-0 justify-center rounded bg-gray text-center">
            <label
              htmlFor="amount-input"
              className="text-body2_bold cursor-pointer select-none px-1.5 py-0.5 text-white"
            >
              SOL
            </label>
          </div>
        </div>
      </div>
      <div className="p-5">
        <Popup actionType={actionType} amount={amount} />
      </div>
    </div>
  );
}
