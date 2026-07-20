type PostBody = {
  text: string;
  entities: Array<{
    type: "mention" | "hashtag" | "link";
    start: number;
    end: number;
    userId?: string;
    url?: string;
  }>;
};

type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

type EngagementSummary = {
  reactions: Record<ReactionType, number>;
  totalReactions: number;
  commentCount: number;
  shareCount: number;
};

type Post = {
  id: string;
  authorId: string;
  body: PostBody;
  mediaIds: string[];
  engagementSummary: EngagementSummary;
  viewerReaction: ReactionType | null;
  viewerHasShared: boolean;
  createdAt: number;
};

type RelationshipToViewer = {
  isFriend?: boolean;
  isFollowing?: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
};

type User = {
  id: string;
  name: string;
  handle: string;
  profilePhotoUrl: string;
  isVerified: boolean;
  relationshipToViewer: RelationshipToViewer;
};

type Feed = {
  id: string;
  postIds: string[];
  olderCursor: string | null;
  newerCursor: string | null;
  hasOlder: boolean;
  hasNewer: boolean;
  lastFetchedAt: number | null;
};

type Media = {
  id: string;
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
};

type ComposerDraft = {
  body: PostBody;
  mediaIds: string[];
  uploadState: "idle" | "uploading" | "failed";
  submitState: "idle" | "submitting" | "submitted" | "failed";
};

type Store = {
  feedsById: Record<string, Feed>;
  postsById: Record<string, Post>;
  usersById: Record<string, User>;
  mediaById: Record<string, Media>;
  composerDraft: ComposerDraft;
};
