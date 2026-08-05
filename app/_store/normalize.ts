import type {
  Post as SourcePost,
  Author as SourceAuthor,
  Media as SourceMedia,
  PostDetail,
} from "../_data-access/types";
import type { FeedPageResponse } from "../_data-access/feed";
import type { Post, User, Media, EngagementSummary } from "./types";

// Converts _data-access response shapes into store shape. The one real transform needed: flat reactionCounts/totalReactions/commentCount/shareCount (data-access Post) → nested engagementSummary (store Post). Author→User and Media→Media are 1:1 passthroughs (still separate functions, per the "each layer owns its types" convention — no cross-layer type reuse even when identical).

// function toStoreUser(author: SourceAuthor): User
// function toStoreMedia(media: SourceMedia): Media

// function normalizeFeedPage(response: FeedPageResponse): {
//   posts: Record<string, Post>;
//   authors: Record<string, User>;
//   media: Record<string, Media>;
//   postIds: string[];
//   pageInfo: FeedPageResponse["pageInfo"];
// }
// function normalizePostDetail(detail: PostDetail): {
//   post: Post;
//   author: User;
//   media: Record<string, Media>;
// }

export function toStorePost(post: SourcePost): Post {
  const engagementSummary: EngagementSummary = {
    reactions: post.reactionCounts,
    totalReactions: post.totalReactions,
    commentCount: post.commentCount,
    shareCount: post.shareCount,
  };

  const storePost: Post = {
    id: post.id,
    authorId: post.authorId,
    body: post.body,
    mediaIds: post.mediaIds,
    engagementSummary,
    viewerReaction: post.viewerReaction,
    viewerHasShared: post.viewerHasShared,
    createdAt: post.createdAt,
  };

  return storePost;
}
