import type { Post, ReactionType } from "./types";

export class ReactionError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ReactionError";
    this.status = status;
  }
}

export async function upsertReaction(
  postId: string,
  viewerId: string,
  type: ReactionType,
): Promise<Post> {
  const searchParams = new URLSearchParams({ viewerId, type });

  const response = await fetch(
    `/api/posts/${postId}/reaction?${searchParams}`,
    {
      method: "PUT",
    },
  );
  const body = await response.json();

  if (!response.ok) {
    throw new ReactionError(response.status, body.error);
  }

  return body;
}

export async function deleteReaction(
  postId: string,
  viewerId: string,
): Promise<Post> {
  const searchParams = new URLSearchParams({ viewerId });

  const response = await fetch(
    `/api/posts/${postId}/reaction?${searchParams}`,
    {
      method: "DELETE",
    },
  );
  const body = await response.json();

  if (!response.ok) {
    throw new ReactionError(response.status, body.error);
  }

  return body;
}
