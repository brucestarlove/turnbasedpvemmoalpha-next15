import { redirect } from "next/navigation";

import { initializePlayer, initializeTown } from "@/actions/game-actions";
import { GameLayout } from "@/components/game/game-layout";
import { auth } from "@/lib/auth";

const GamePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Initialize player and town data for new users
  await initializePlayer(session.user.id);
  await initializeTown();

  return (
    <div className="bg-background min-h-screen">
      <GameLayout userId={session.user.id} />
    </div>
  );
};

export default GamePage;
