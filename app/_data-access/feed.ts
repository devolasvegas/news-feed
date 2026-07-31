import type { PostBody, ReactionType } from "./types";

export type FetchFeedParams = {
  viewerId: string;
  cursor?: string;
  direction?: "older" | "newer";
  limit?: number;
};

export type FeedPost = {
  id: string;
  authorId: string;
  body: PostBody;
  mediaIds: string[];
  reactionCounts: Record<ReactionType, number>;
  totalReactions: number;
  commentCount: number;
  shareCount: number;
  viewerReaction: ReactionType | null;
  viewerHasShared: boolean;
  createdAt: number;
};

export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  profilePhotoUrl: string;
  isVerified: boolean;
  relationshipToViewer: {
    isFriend?: boolean;
    isFollowing?: boolean;
    isMuted?: boolean;
    isBlocked?: boolean;
  };
};

export type FeedMedia = {
  id: string;
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
};

export type FeedPageResponse = {
  posts: FeedPost[];
  authors: FeedAuthor[];
  media: FeedMedia[];
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
  let response;

  if (!response.ok) {
    const body = await response.json();
    throw new FetchFeedError(response.status, body.error);
  }
}
