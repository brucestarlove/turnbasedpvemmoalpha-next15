import { NextRequest, NextResponse } from "next/server";

import { giveCoins } from "@/actions/admin-actions";

export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Missing userId or invalid amount" },
        { status: 400 },
      );
    }

    const result = await giveCoins(userId, amount);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin give-coins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
