import { NextRequest, NextResponse } from "next/server";
import { getPostById } from "../../../_server/services/postService";
import { InvalidUserError } from "../../../_server/dto";

// Route to fetch a single post surface or permalink page using the GET method
export async function GET(
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
    post = await getPostById(postId, viewerId);
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
