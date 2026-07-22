// Server-side (mock "database") types.
//
// These deliberately do NOT mirror `_store/types.ts` one-for-one. The store
// holds a *viewer-relative, denormalized* shape (e.g. `Post.viewerReaction`,
// `User.relationshipToViewer`) that only makes sense once you know who's
// asking. A database row can't know that — reactions, shares, and
// relationships are facts about (subject, viewer) pairs, so they live in
// their own tables/edges here and get folded into the store's shape by the
// data-access layer + services, on a per-request basis.
//
// Aggregate counters (reactionCounts, commentCount, shareCount) ARE
// denormalized onto the post row, the way a real feed DB would cache them
// for read performance rather than COUNT(*)-ing on every request.

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export type PostBody = {
  text: string;
  entities: Array<{
    type: "mention" | "hashtag" | "link";
    start: number;
    end: number;
    userId?: string;
    url?: string;
  }>;
};

export type DbUser = {
  id: string;
  name: string;
  handle: string;
  profilePhotoUrl: string;
  isVerified: boolean;
};

// One row per (viewer, target) fact. Multiple edge types can exist for the
// same pair (e.g. friend AND following).
export type RelationshipEdgeType = "friend" | "following" | "muted" | "blocked";

export type DbRelationshipEdge = {
  viewerId: string;
  targetUserId: string;
  type: RelationshipEdgeType;
};

export type DbMedia = {
  id: string;
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
};

export type DbPost = {
  id: string;
  authorId: string;
  body: PostBody;
  mediaIds: string[];
  reactionCounts: Record<ReactionType, number>;
  commentCount: number;
  shareCount: number;
  createdAt: number;
};

// Source of truth for "did this viewer react, and with what" — looked up
// per-request rather than stored on the post.
export type DbReaction = {
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: number;
};

// Source of truth for "has this viewer shared this post."
export type DbShare = {
  postId: string;
  userId: string;
  createdAt: number;
};
