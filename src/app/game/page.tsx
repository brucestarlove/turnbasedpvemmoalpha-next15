import { redirect } from "next/navigation";

import { initializeGame } from "@/actions/game-actions";
import { GameLayout } from "@/components/game/game-layout";
import { auth } from "@/lib/auth";

const GamePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Initialize game data (player, town, logs) in one batched call
  await initializeGame(session.user.id);

  return (
    <div className="bg-background min-h-screen">
      <GameLayout userId={session.user.id} />
    </div>
  );
};

export default GamePage;
