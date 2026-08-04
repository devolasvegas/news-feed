import type { Post, Author, Media } from "./types";

export type FetchFeedParams = {
  viewerId: string;
  cursor?: string;
  direction?: "older" | "newer";
  limit?: number;
};

export type FeedPageResponse = {
  posts: Post[];
  authors: Author[];
  media: Media[];
  pageInfo: {
    olderCursor: string | null;
    newerCursor: string | null;
    hasOlder: boolean;
    hasNewer: boolean;
  };
};

export class FetchFeedError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "FetchFeedError";
    this.status = status;
  }
}

export async function fetchFeed(
  params: FetchFeedParams,
): Promise<FeedPageResponse> {
  const searchParams = new URLSearchParams({ viewerId: params.viewerId });
  if (params.cursor !== undefined) searchParams.set("cursor", params.cursor);
  if (params.direction !== undefined)
    searchParams.set("direction", params.direction);
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));

  const response = await fetch(`/api/feed?${searchParams.toString()}`, {
    method: "GET",
  });
  const body = await response.json();

  if (!response.ok) {
    throw new FetchFeedError(response.status, body.error);
  }

  return body;
}
