import { NextResponse, NextRequest } from "next/server";
import {
  getFeed,
  InvalidCursorError,
} from "../../_server/services/feedService";

// Route to fetch the feed results for a user usin g the GET method
// Will implement cursor-based pagination
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const viewerId = searchParams.get("viewerId");

  if (!viewerId) {
    return NextResponse.json(
      { error: "viewerId is required" },
      { status: 400 },
    );
  }

  const cursor = searchParams.get("cursor");
  const direction = searchParams.get("direction") ?? undefined;

  if (
    direction !== undefined &&
    direction !== "older" &&
    direction !== "newer"
  ) {
    return NextResponse.json(
      { error: "direction is invalid" },
      { status: 400 },
    );
  }

  const rawLimit = searchParams.get("limit");
  let limit: number | undefined;

  if (rawLimit !== null) {
    limit = Number(rawLimit);

    if (!Number.isInteger(limit) || limit <= 0) {
      return NextResponse.json({ error: "limit is invalid" }, { status: 400 });
    }
  }

  let feedPage;

  try {
    feedPage = await getFeed({ viewerId, cursor, direction, limit });
  } catch (err) {
    if (err instanceof InvalidCursorError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    throw err;
  }

  return NextResponse.json(feedPage);
}
