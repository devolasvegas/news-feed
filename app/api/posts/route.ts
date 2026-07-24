import { NextRequest, NextResponse } from "next/server";

// route for new post creation using the POST method
export async function POST(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const viewerId = params.get("viewrId");

  if (!viewerId) {
    return NextResponse.json(
      { message: "viewerId is required" },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "Post Creation Route" }, { status: 200 });
}
