import type { Post, User, Media } from "../../_store/types";

export const mockAuthor: User = {
  id: "user_1",
  name: "Priya Natarajan",
  handle: "priyanat",
  profilePhotoUrl: "https://i.pravatar.cc/150?img=47",
  isVerified: true,
  relationshipToViewer: {
    isFriend: true,
    isFollowing: true,
  },
};

export const mockMedia: Media[] = [
  {
    id: "media_1",
    src: "https://picsum.photos/id/1015/1200/800",
    previewSrc: "https://picsum.photos/id/1015/40/27",
    alt: "A river winding through a forested valley",
    width: 1200,
    height: 800,
  },
];

export const mockPost: Post = {
  id: "post_1",
  authorId: mockAuthor.id,
  body: {
    text: "Just got back from the trail — @priyanat wasn't kidding about the view. #hiking",
    entities: [
      { type: "mention", start: 31, end: 40, userId: mockAuthor.id },
      { type: "hashtag", start: 72, end: 79 },
    ],
  },
  mediaIds: mockMedia.map((item) => item.id),
  engagementSummary: {
    reactions: {
      like: 42,
      love: 11,
      haha: 0,
      wow: 3,
      sad: 0,
      angry: 0,
    },
    totalReactions: 56,
    commentCount: 8,
    shareCount: 2,
  },
  viewerReaction: "like",
  viewerHasShared: false,
  createdAt: Date.now() - 1000 * 60 * 60 * 3,
};

export const mockPostProps: { post: Post; author: User; media: Media[] } = {
  post: mockPost,
  author: mockAuthor,
  media: mockMedia,
};
