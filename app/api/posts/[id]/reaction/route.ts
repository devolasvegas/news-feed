import { NextRequest, NextResponse } from "next/server";
import {
  upsertReaction,
  deleteReaction,
} from "../../../../_server/services/reactionService";
import { ReactionType } from "@/app/_server/types";
import { InvalidUserError } from "@/app/_server/dto";

// Route to set or change the viewer's reaction using the PUT method, or remove the viewer's reaction using the DELETE method
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const viewerId = searchParams.get("viewerId");

  if (!viewerId) {
    return NextResponse.json(
      { error: "viewerId is required" },
      { status: 400 },
    );
  }

  const { id: postId } = await params;

  if (!postId) {
    return NextResponse.json({ error: "post ID is required" }, { status: 400 });
  }

  const reactionType = searchParams.get("type");

  if (!reactionType) {
    return NextResponse.json(
      { error: "Reaction type is required" },
      { status: 400 },
    );
  }

  // Validate reaction types
  const VALID_REACTIONS: ReactionType[] = [
    "like",
    "love",
    "haha",
    "wow",
    "sad",
    "angry",
  ];

  // Validate reaction type passed in the request
  if (!VALID_REACTIONS.includes(reactionType as ReactionType)) {
    return NextResponse.json(
      { error: "Invalid reaction type" },
      { status: 400 },
    );
  }

  let post;

  try {
    post = await upsertReaction(postId, viewerId, reactionType as ReactionType);
  } catch (err) {
    if (err instanceof InvalidUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  const viewerId = searchParams.get("viewerId");

  if (!viewerId) {
    return NextResponse.json(
      { error: "viewerId is required" },
      { status: 400 },
    );
  }

  const { id: postId } = await params;

  if (!postId) {
    return NextResponse.json({ error: "post ID is required" }, { status: 400 });
  }

  let post;

  try {
    post = await deleteReaction(postId, viewerId);
  } catch (err) {
    if (err instanceof InvalidUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
