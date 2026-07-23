import { media, reactions, shares } from "./db/posts";
import { relationshipEdges, users } from "./db/users";
import type {
  DbMedia,
  DbPost,
  DbRelationshipEdge,
  DbUser,
  PostBody,
  ReactionType,
  RelationshipEdgeType,
} from "./types";

// --- Response shapes -------------------------------------------------------
//
// These are deliberately NOT `_store/types.ts` shapes. This is the "raw API
// response" the article describes — normalized-ish (posts / authors / media
// as separate lists, referencing each other by id) so the payload doesn't
// repeat a full author object on every post. The data-access layer's job is
// to fold this into the store's per-entity maps.
//
// Shared across every service that hands back a post (feed, single post,
// reactions, ...) so they all agree on one shape instead of data-access
// having to reconcile several slightly-different ones.

export type PostDTO = {
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

export type AuthorDTO = {
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

export type MediaDTO = DbMedia;

// --- Lookups -------------------------------------------------------------

export const usersById = new Map<string, DbUser>(
  users.map((user) => [user.id, user]),
);

export async function getMediaByIds(
  ids: Iterable<string>,
): Promise<MediaDTO[]> {
  const idSet = new Set(ids);
  return media.filter((m) => idSet.has(m.id));
}

export async function getAuthorOrThrow(authorId: string): Promise<DbUser> {
  const author = usersById.get(authorId);

  if (!author) {
    throw new Error(`Post references unknown author id: ${authorId}`);
  }

  return author;
}

// --- Assembly --------------------------------------------------------------

export function relationshipToViewer(
  viewerId: string,
  targetUserId: string,
): AuthorDTO["relationshipToViewer"] {
  const edgeFlag: Record<
    RelationshipEdgeType,
    keyof AuthorDTO["relationshipToViewer"]
  > = {
    friend: "isFriend",
    following: "isFollowing",
    muted: "isMuted",
    blocked: "isBlocked",
  };

  const edges = relationshipEdges.filter(
    (edge: DbRelationshipEdge) =>
      edge.viewerId === viewerId && edge.targetUserId === targetUserId,
  );

  const relationship: AuthorDTO["relationshipToViewer"] = {};
  for (const edge of edges) {
    relationship[edgeFlag[edge.type]] = true;
  }
  return relationship;
}

export function toAuthorDTO(author: DbUser, viewerId: string): AuthorDTO {
  return {
    id: author.id,
    name: author.name,
    handle: author.handle,
    profilePhotoUrl: author.profilePhotoUrl,
    isVerified: author.isVerified,
    relationshipToViewer: relationshipToViewer(viewerId, author.id),
  };
}

export function toPostDTO(post: DbPost, viewerId: string): PostDTO {
  const totalReactions = Object.values(post.reactionCounts).reduce(
    (sum, n) => sum + n,
    0,
  );
  const viewerReaction =
    reactions.find((r) => r.postId === post.id && r.userId === viewerId)
      ?.type ?? null;
  const viewerHasShared = shares.some(
    (s) => s.postId === post.id && s.userId === viewerId,
  );

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
