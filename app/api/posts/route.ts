import { NextRequest, NextResponse } from "next/server";
import { createPost } from "../../_server/services/postService";
import { InvalidUserError } from "../../_server/dto";
import { isValidEntity } from "@/app/_server/validation";

// route for new post creation using the POST method
export async function POST(request: NextRequest): Promise<NextResponse> {
  let json;

  // Catch empty or malformed body
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body missing or invalid" },
      { status: 400 },
    );
  }

  // Check for literal `null` body
  if (!json) {
    return NextResponse.json(
      { error: "Request body missing" },
      { status: 400 },
    );
  }

  const { viewerId, body, mediaIds } = json;

  if (!viewerId) {
    return NextResponse.json(
      { error: "viewerId is required" },
      { status: 400 },
    );
  }

  // Ensure body and body text
  if (!body || !body.text) {
    return NextResponse.json(
      { error: "Post body is invalid" },
      { status: 400 },
    );
  }

  // Validate body.entities
  if (
    !body.entities.every((e: unknown) => isValidEntity(e, body.text.length))
  ) {
    return NextResponse.json(
      { error: "Post body.entities is invalid" },
      { status: 400 },
    );
  }

  // Ensure mediaIds is an array of strings
  if (
    mediaIds !== undefined &&
    (!Array.isArray(mediaIds) ||
      !mediaIds.every((item) => typeof item === "string"))
  ) {
    return NextResponse.json({ error: "mediaIds is invalid" }, { status: 400 });
  }

  let post;

  try {
    post = await createPost({ authorId: viewerId, body, mediaIds });
  } catch (err) {
    if (err instanceof InvalidUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json(post, { status: 201 });
}
