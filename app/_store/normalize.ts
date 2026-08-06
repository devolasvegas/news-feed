import type {
  Post as SourcePost,
  Author as SourceAuthor,
  Media as SourceMedia,
  PostDetail,
} from "../_data-access/types";
import type { FeedPageResponse } from "../_data-access/feed";
import type { Post, User, Media, EngagementSummary } from "./types";

// Converts _data-access response shapes into store shape. The one real transform needed: flat reactionCounts/totalReactions/commentCount/shareCount (data-access Post) → nested engagementSummary (store Post). Author→User and Media→Media are 1:1 passthroughs (still separate functions, per the "each layer owns its types" convention — no cross-layer type reuse even when identical).

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

export function toStoreUser(author: SourceAuthor): User {
  const storeUser: User = {
    id: author.id,
    name: author.name,
    handle: author.handle,
    profilePhotoUrl: author.profilePhotoUrl,
    isVerified: author.isVerified,
    relationshipToViewer: author.relationshipToViewer,
  };

  return storeUser;
}

export function toStoreMedia(media: SourceMedia): Media {
  const storeMedia: Media = {
    id: media.id,
    src: media.src,
    previewSrc: media.previewSrc,
    alt: media.alt,
    width: media.width,
    height: media.height,
  };

  return storeMedia;
}

export function normalizeFeedPage(response: FeedPageResponse): {
  posts: Record<string, Post>;
  authors: Record<string, User>;
  media: Record<string, Media>;
  postIds: string[];
  pageInfo: FeedPageResponse["pageInfo"];
} {
  const storeFeedPage = {
    posts: Object.fromEntries(
      response.posts.map((post) => [post.id, toStorePost(post)]),
    ),
    authors: Object.fromEntries(
      response.authors.map((author) => [author.id, toStoreUser(author)]),
    ),
    media: Object.fromEntries(
      response.media.map((item) => [item.id, toStoreMedia(item)]),
    ),
    postIds: response.posts.map((post) => post.id),
    pageInfo: response.pageInfo,
  };

  return storeFeedPage;
}

export function normalizePostDetail(detail: PostDetail): {
  post: Post;
  author: User;
  media: Record<string, Media>;
} {
  const storePostDetail = {
    post: toStorePost(detail.post),
    author: toStoreUser(detail.author),
    media: Object.fromEntries(
      detail.media.map((item) => [item.id, toStoreMedia(item)]),
    ),
  };

  return storePostDetail;
}
