import { NextRequest, NextResponse } from "next/server";

import { giveSkillXP } from "@/actions/admin-actions";

export async function POST(request: NextRequest) {
  try {
    const { userId, skill, xp } = await request.json();

    if (!userId || !skill || typeof xp !== "number") {
      return NextResponse.json(
        { error: "Missing userId, skill, or invalid xp" },
        { status: 400 },
      );
    }

    const result = await giveSkillXP(userId, skill, xp);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin give-skill-xp error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
