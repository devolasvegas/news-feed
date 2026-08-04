// Converts _data-access response shapes into store shape. The one real transform needed: flat reactionCounts/totalReactions/commentCount/shareCount (data-access Post) → nested engagementSummary (store Post). Author→User and Media→Media are 1:1 passthroughs (still separate functions, per the "each layer owns its types" convention — no cross-layer type reuse even when identical).

// function toStorePost(post: DataAccessPost): Post
// function toStoreUser(author: Author): User
// function toStoreMedia(media: Media): Media
// function normalizeFeedPage(response: FeedPageResponse): {
//   posts: Record<string, Post>; authors: Record<string, User>;
//   media: Record<string, Media>; postIds: string[];
//   pageInfo: FeedPageResponse["pageInfo"];
// }
// function normalizePostDetail(detail: PostDetail): {
//   post: Post; author: User; media: Record<string, Media>;
// }
