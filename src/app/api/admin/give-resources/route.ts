import { NextRequest, NextResponse } from "next/server";

import { giveResources } from "@/actions/admin-actions";

export async function POST(request: NextRequest) {
  try {
    const { userId, resources } = await request.json();

    if (!userId || !resources) {
      return NextResponse.json(
        { error: "Missing userId or resources" },
        { status: 400 },
      );
    }

    const result = await giveResources(userId, resources);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin give-resources error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
