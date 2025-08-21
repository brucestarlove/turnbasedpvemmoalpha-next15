"use client";

import { useState } from "react";

import {
  giveCoins,
  giveResources,
  giveSkillXP,
  setPlayerStats,
} from "@/actions/admin-actions";

export default function AdminPage() {
  const [userId, setUserId] = useState("74aaaacf-4e41-46fd-88cc-bd92876117f7");
  const [result, setResult] = useState("");

  const handleGiveResources = async () => {
    const result = await giveResources(userId, {
      wood: 100,
      stone: 50,
      sturdy_wood: 10,
    });
    setResult(JSON.stringify(result, null, 2));
  };

  const handleGiveCoins = async () => {
    const result = await giveCoins(userId, 1000);
    setResult(JSON.stringify(result, null, 2));
  };

  const handleSetStats = async () => {
    const result = await setPlayerStats(userId, { strength: 20, stamina: 20 });
    setResult(JSON.stringify(result, null, 2));
  };

  const handleGiveXP = async () => {
    const result = await giveSkillXP(userId, "woodcutting", 500);
    setResult(JSON.stringify(result, null, 2));
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>

      <div className="mb-4">
        <label htmlFor="userId" className="mb-2 block text-sm font-medium">
          User ID:
        </label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full rounded border p-2"
        />
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGiveResources}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Give Resources (100 wood, 50 stone)
        </button>

        <button
          onClick={handleGiveCoins}
          className="ml-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Give 1000 Coins
        </button>

        <button
          onClick={handleSetStats}
          className="ml-2 rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          Set Stats (20 STR, 20 STA)
        </button>

        <button
          onClick={handleGiveXP}
          className="ml-2 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          Give 500 Woodcutting XP
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Result:</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
