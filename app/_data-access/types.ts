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

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export type PostDetail = {
  post: Post;
  author: Author;
  media: Media[];
};

export type Post = {
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

export type Author = {
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

export type Media = {
  id: string;
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
};
