import type { PostBody, PostDetail } from "./types";

export type CreatePostParams = {
  viewerId: string;
  body: PostBody;
  mediaIds?: string[];
};

export class PostError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PostError";
    this.status = status;
  }
}

export async function fetchPost(
  postId: string,
  viewerId: string,
): Promise<PostDetail> {
  const searchParams = new URLSearchParams({ viewerId });

  const response = await fetch(`/api/posts/${postId}?${searchParams}`, {
    method: "GET",
  });
  const body = await response.json();

  if (!response.ok) {
    throw new PostError(response.status, body.error);
  }

  return body;
}

export async function createPost(
  params: CreatePostParams,
): Promise<PostDetail> {
  const response = await fetch("/api/posts", {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const body = await response.json();

  if (!response.ok) {
    throw new PostError(response.status, body.error);
  }

  return body;
}
