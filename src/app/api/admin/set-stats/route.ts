import { NextRequest, NextResponse } from "next/server";

import { setPlayerStats } from "@/actions/admin-actions";

export async function POST(request: NextRequest) {
  try {
    const { userId, stats } = await request.json();

    if (!userId || !stats) {
      return NextResponse.json(
        { error: "Missing userId or stats" },
        { status: 400 },
      );
    }

    const result = await setPlayerStats(userId, stats);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin set-stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
