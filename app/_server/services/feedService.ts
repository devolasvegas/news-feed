import { media, posts, reactions, shares } from "../db/posts";
import { relationshipEdges, users } from "../db/users";
import type {
  DbMedia,
  DbRelationshipEdge,
  DbUser,
  PostBody,
  ReactionType,
  RelationshipEdgeType,
} from "../types";

// --- Response shapes -------------------------------------------------------
//
// These are deliberately NOT `_store/types.ts` shapes. This is the "raw API
// response" the article describes — normalized-ish (posts / authors / media
// as separate lists, referencing each other by id) so the payload doesn't
// repeat a full author object on every post. The data-access layer's job is
// to fold this into the store's per-entity maps.

export type FeedPostDTO = {
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

export type FeedAuthorDTO = {
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

export type FeedMediaDTO = DbMedia;

export type FeedPage = {
  posts: FeedPostDTO[];
  authors: FeedAuthorDTO[];
  media: FeedMediaDTO[];
  pageInfo: {
    olderCursor: string | null;
    newerCursor: string | null;
    hasOlder: boolean;
    hasNewer: boolean;
  };
};

export type GetFeedParams = {
  viewerId: string;
  cursor?: string | null;
  direction?: "older" | "newer";
  limit?: number;
};

export class InvalidCursorError extends Error {
  constructor(cursor: string) {
    super(`Invalid or stale feed cursor: ${cursor}`);
    this.name = "InvalidCursorError";
  }
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// --- Cursor encoding ---------------------------------------------------
//
// The cursor is an opaque token, not a page offset — the README calls this
// out as the reason cursor pagination fits a feed where posts can be
// inserted/removed between requests. It encodes the anchor post's id *and*
// its createdAt, so a stale cursor (pointing at a since-deleted post, or one
// whose sort key changed) can be detected instead of silently
// misbehaving. Ranking here is reverse-chronological; a real ranking
// service would swap `createdAt` for whatever score it sorts by, but the
// cursor mechanics stay the same.

type CursorPayload = { id: string; createdAt: number };

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor: string): CursorPayload {
  try {
    const payload = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
    if (typeof payload?.id === "string" && typeof payload?.createdAt === "number") {
      return payload;
    }
  } catch {
    // fall through to the shared error below
  }
  throw new InvalidCursorError(cursor);
}

// --- Lookups -------------------------------------------------------------

const usersById = new Map<string, DbUser>(users.map((user) => [user.id, user]));

// Rank = reverse-chronological, id as a tiebreaker for a deterministic order
// when two posts share a createdAt (as ours do, being seeded on the hour).
const rankedPosts = [...posts].sort((a, b) => {
  if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
  return b.id.localeCompare(a.id);
});

function relationshipToViewer(
  viewerId: string,
  authorId: string,
): FeedAuthorDTO["relationshipToViewer"] {
  const edgeFlag: Record<RelationshipEdgeType, keyof FeedAuthorDTO["relationshipToViewer"]> = {
    friend: "isFriend",
    following: "isFollowing",
    muted: "isMuted",
    blocked: "isBlocked",
  };

  const edges = relationshipEdges.filter(
    (edge: DbRelationshipEdge) => edge.viewerId === viewerId && edge.targetUserId === authorId,
  );

  const relationship: FeedAuthorDTO["relationshipToViewer"] = {};
  for (const edge of edges) {
    relationship[edgeFlag[edge.type]] = true;
  }
  return relationship;
}

function toPostDTO(post: (typeof posts)[number], viewerId: string): FeedPostDTO {
  const totalReactions = Object.values(post.reactionCounts).reduce((sum, n) => sum + n, 0);
  const viewerReaction =
    reactions.find((r) => r.postId === post.id && r.userId === viewerId)?.type ?? null;
  const viewerHasShared = shares.some((s) => s.postId === post.id && s.userId === viewerId);

  return {
    id: post.id,
    authorId: post.authorId,
    body: post.body,
    mediaIds: post.mediaIds,
    reactionCounts: post.reactionCounts,
    totalReactions,
    commentCount: post.commentCount,
    shareCount: post.shareCount,
    viewerReaction,
    viewerHasShared,
    createdAt: post.createdAt,
  };
}

/**
 * Fetch a page of the feed for `viewerId`.
 *
 * Mirrors what a real service would do against Postgres + Redis: pick a
 * slice of ranked posts around an opaque cursor, then assemble the
 * viewer-relative fields (reaction/share/relationship) via what would be
 * joins there and are `.filter()`/`.find()` here. Kept `async` so call
 * sites don't need to change when the in-memory arrays are swapped for real
 * queries.
 */
export async function getFeed({
  viewerId,
  cursor = null,
  direction = "older",
  limit = DEFAULT_LIMIT,
}: GetFeedParams): Promise<FeedPage> {
  const pageSize = Math.min(Math.max(1, limit), MAX_LIMIT);

  let startIndex = 0;
  let endIndex = Math.min(pageSize, rankedPosts.length);

  if (cursor) {
    const { id, createdAt } = decodeCursor(cursor);
    const anchorIndex = rankedPosts.findIndex((p) => p.id === id);
    if (anchorIndex === -1 || rankedPosts[anchorIndex].createdAt !== createdAt) {
      throw new InvalidCursorError(cursor);
    }

    if (direction === "older") {
      startIndex = anchorIndex + 1;
      endIndex = Math.min(startIndex + pageSize, rankedPosts.length);
    } else {
      endIndex = anchorIndex;
      startIndex = Math.max(0, endIndex - pageSize);
    }
  }

  const pageSlice = rankedPosts.slice(startIndex, endIndex);

  const hasNewer = startIndex > 0;
  const hasOlder = endIndex < rankedPosts.length;
  const newerCursor =
    hasNewer && pageSlice.length > 0
      ? encodeCursor({ id: pageSlice[0].id, createdAt: pageSlice[0].createdAt })
      : null;
  const olderCursor =
    hasOlder && pageSlice.length > 0
      ? encodeCursor({
          id: pageSlice[pageSlice.length - 1].id,
          createdAt: pageSlice[pageSlice.length - 1].createdAt,
        })
      : null;

  const authorIds = new Set(pageSlice.map((p) => p.authorId));
  const mediaIds = new Set(pageSlice.flatMap((p) => p.mediaIds));

  const authors: FeedAuthorDTO[] = [...authorIds].map((authorId) => {
    const author = usersById.get(authorId);
    if (!author) {
      throw new Error(`Post references unknown author id: ${authorId}`);
    }
    return {
      id: author.id,
      name: author.name,
      handle: author.handle,
      profilePhotoUrl: author.profilePhotoUrl,
      isVerified: author.isVerified,
      relationshipToViewer: relationshipToViewer(viewerId, author.id),
    };
  });

  const pageMedia: FeedMediaDTO[] = media.filter((m) => mediaIds.has(m.id));

  return {
    posts: pageSlice.map((post) => toPostDTO(post, viewerId)),
    authors,
    media: pageMedia,
    pageInfo: { olderCursor, newerCursor, hasOlder, hasNewer },
  };
}
