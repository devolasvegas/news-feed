import type {
  DbMedia,
  DbPost,
  DbReaction,
  DbShare,
  ReactionType,
} from "../types";
import { VIEWER_ID } from "./users";

// Fills in the ReactionType keys a post doesn't mention with 0, so seed
// entries below only have to spell out the counts that matter.
export function reactionCounts(
  partial: Partial<Record<ReactionType, number>>,
): Record<ReactionType, number> {
  return {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    ...partial,
  };
}

// Posts are seeded one hour apart, newest first, so cursor pagination has a
// stable, human-readable ordering to page through.
const NOW = Date.now();
const hoursAgo = (n: number) => NOW - n * 60 * 60 * 1000;

export const media: DbMedia[] = [
  {
    id: "m1",
    src: "https://picsum.photos/seed/newsfeed-1/800/600",
    previewSrc: "https://picsum.photos/seed/newsfeed-1/40/30",
    alt: "Mountain trail at sunrise",
    width: 800,
    height: 600,
  },
  {
    id: "m2",
    src: "https://picsum.photos/seed/newsfeed-2/800/600",
    previewSrc: "https://picsum.photos/seed/newsfeed-2/40/30",
    alt: "City skyline at dusk",
    width: 800,
    height: 600,
  },
  {
    id: "m3",
    src: "https://picsum.photos/seed/newsfeed-3/600/800",
    previewSrc: "https://picsum.photos/seed/newsfeed-3/30/40",
    alt: "Plate of homemade pasta",
    width: 600,
    height: 800,
  },
  {
    id: "m4",
    src: "https://picsum.photos/seed/newsfeed-4/800/600",
    previewSrc: "https://picsum.photos/seed/newsfeed-4/40/30",
    alt: "Golden retriever running on a beach",
    width: 800,
    height: 600,
  },
  {
    id: "m5",
    src: "https://picsum.photos/seed/newsfeed-5/800/450",
    previewSrc: "https://picsum.photos/seed/newsfeed-5/40/22",
    alt: "Conference room during a talk",
    width: 800,
    height: 450,
  },
  {
    id: "m6",
    src: "https://picsum.photos/seed/newsfeed-6/600/600",
    previewSrc: "https://picsum.photos/seed/newsfeed-6/30/30",
    alt: "Houseplants on a windowsill",
    width: 600,
    height: 600,
  },
  {
    id: "m7",
    src: "https://picsum.photos/seed/newsfeed-7/800/600",
    previewSrc: "https://picsum.photos/seed/newsfeed-7/40/30",
    alt: "Vinyl record collection",
    width: 800,
    height: 600,
  },
  {
    id: "m8",
    src: "https://picsum.photos/seed/newsfeed-8/800/600",
    previewSrc: "https://picsum.photos/seed/newsfeed-8/40/30",
    alt: "Marathon runners at the starting line",
    width: 800,
    height: 600,
  },
];

export const posts: DbPost[] = [
  {
    id: "p1",
    authorId: "u2",
    body: {
      text: "Finally got the trail run in before the rain hit. Worth the 5am alarm.",
      entities: [],
    },
    mediaIds: ["m1"],
    reactionCounts: reactionCounts({ like: 12, love: 4, wow: 1 }),
    commentCount: 3,
    shareCount: 1,
    createdAt: hoursAgo(1),
  },
  {
    id: "p2",
    authorId: "u3",
    body: {
      text: "Excited to share that our team's proposal on #accessibility tooling got accepted for the conference!",
      entities: [{ type: "hashtag", start: 60, end: 74 }],
    },
    mediaIds: ["m5"],
    reactionCounts: reactionCounts({ like: 40, love: 22, wow: 5 }),
    commentCount: 11,
    shareCount: 6,
    createdAt: hoursAgo(2),
  },
  {
    id: "p3",
    authorId: "u4",
    body: {
      text: "Made pasta from scratch for the first time. 10/10, would make a mess again.",
      entities: [],
    },
    mediaIds: ["m3"],
    reactionCounts: reactionCounts({ like: 8, haha: 3, love: 2 }),
    commentCount: 2,
    shareCount: 0,
    createdAt: hoursAgo(3),
  },
  {
    id: "p4",
    authorId: "u1",
    body: {
      text: "Reminder to myself: ship the news feed demo before overthinking the composer UI.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ like: 5, haha: 1 }),
    commentCount: 1,
    shareCount: 0,
    createdAt: hoursAgo(4),
  },
  {
    id: "p5",
    authorId: "u5",
    body: {
      text: "Rio said hi to everyone he passed on the boardwalk today. No exceptions.",
      entities: [],
    },
    mediaIds: ["m4"],
    reactionCounts: reactionCounts({ love: 30, like: 10, haha: 2 }),
    commentCount: 7,
    shareCount: 2,
    createdAt: hoursAgo(5),
  },
  {
    id: "p6",
    authorId: "u6",
    body: {
      text: "Hot take: the b-side is better than the single. Fight me.",
      entities: [],
    },
    mediaIds: ["m7"],
    reactionCounts: reactionCounts({ like: 6, haha: 4, angry: 1 }),
    commentCount: 9,
    shareCount: 1,
    createdAt: hoursAgo(6),
  },
  {
    id: "p7",
    authorId: "u7",
    body: {
      text: "Grateful for a slower week. Repotted every plant that's been begging for it since spring.",
      entities: [],
    },
    mediaIds: ["m6"],
    reactionCounts: reactionCounts({ like: 15, love: 9 }),
    commentCount: 2,
    shareCount: 0,
    createdAt: hoursAgo(8),
  },
  {
    id: "p8",
    authorId: "u2",
    body: {
      text: "Down bad training log, week 3: still can't run a 10k without questioning my choices.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ haha: 14, like: 6 }),
    commentCount: 5,
    shareCount: 0,
    createdAt: hoursAgo(10),
  },
  {
    id: "p9",
    authorId: "u8",
    body: {
      text: "Race day. Nervous, but the good kind.",
      entities: [],
    },
    mediaIds: ["m8"],
    reactionCounts: reactionCounts({ like: 22, love: 5, wow: 3 }),
    commentCount: 4,
    shareCount: 1,
    createdAt: hoursAgo(12),
  },
  {
    id: "p10",
    authorId: "u3",
    body: {
      text: "PSA: @jordanlee's talk on caching strategies is one of the best I've seen this year.",
      entities: [{ type: "mention", start: 5, end: 17, userId: "u4" }],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ like: 28, love: 6, wow: 2 }),
    commentCount: 6,
    shareCount: 4,
    createdAt: hoursAgo(14),
  },
  {
    id: "p11",
    authorId: "u4",
    body: {
      text: "Slides from today's talk are up: https://example.com/caching-slides",
      entities: [
        {
          type: "link",
          start: 34,
          end: 62,
          url: "https://example.com/caching-slides",
        },
      ],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ like: 19, wow: 1 }),
    commentCount: 3,
    shareCount: 8,
    createdAt: hoursAgo(15),
  },
  {
    id: "p12",
    authorId: "u5",
    body: {
      text: "Sunset over the harbor tonight was unreal. Didn't even edit this.",
      entities: [],
    },
    mediaIds: ["m2"],
    reactionCounts: reactionCounts({ love: 18, wow: 9, like: 7 }),
    commentCount: 2,
    shareCount: 3,
    createdAt: hoursAgo(18),
  },
  {
    id: "p13",
    authorId: "u6",
    body: {
      text: "Unpopular opinion: cold brew is just coffee that's given up.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ haha: 21, angry: 3, like: 4 }),
    commentCount: 13,
    shareCount: 0,
    createdAt: hoursAgo(20),
  },
  {
    id: "p14",
    authorId: "u1",
    body: {
      text: "Two years at this job today. Still figuring it out, still glad I stayed.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ love: 14, like: 9 }),
    commentCount: 5,
    shareCount: 0,
    createdAt: hoursAgo(22),
  },
  {
    id: "p15",
    authorId: "u7",
    body: {
      text: "Every plant on this sill is a survivor of at least one vacation. Respect.",
      entities: [],
    },
    mediaIds: ["m6"],
    reactionCounts: reactionCounts({ like: 10, haha: 2 }),
    commentCount: 1,
    shareCount: 0,
    createdAt: hoursAgo(26),
  },
  {
    id: "p16",
    authorId: "u8",
    body: {
      text: "Official: signing up for the next one before I forget how much today hurt.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ haha: 17, like: 11 }),
    commentCount: 4,
    shareCount: 0,
    createdAt: hoursAgo(30),
  },
  {
    id: "p17",
    authorId: "u2",
    body: {
      text: "Found a $2 record store copy of an album I've been hunting for years.",
      entities: [],
    },
    mediaIds: ["m7"],
    reactionCounts: reactionCounts({ like: 9, wow: 4 }),
    commentCount: 2,
    shareCount: 0,
    createdAt: hoursAgo(34),
  },
  {
    id: "p18",
    authorId: "u3",
    body: {
      text: "Mentoring session #4 done. Watching someone else's 'aha' moment never gets old.",
      entities: [{ type: "hashtag", start: 19, end: 20 }],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ love: 25, like: 12 }),
    commentCount: 3,
    shareCount: 1,
    createdAt: hoursAgo(40),
  },
  {
    id: "p19",
    authorId: "u4",
    body: {
      text: "Debugged a caching bug for 6 hours. It was a typo. It's always a typo.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ haha: 33, like: 10 }),
    commentCount: 8,
    shareCount: 2,
    createdAt: hoursAgo(46),
  },
  {
    id: "p20",
    authorId: "u5",
    body: {
      text: "Rio's first time seeing snow. He was not a fan.",
      entities: [],
    },
    mediaIds: ["m4"],
    reactionCounts: reactionCounts({ haha: 20, love: 15 }),
    commentCount: 6,
    shareCount: 1,
    createdAt: hoursAgo(50),
  },
  {
    id: "p21",
    authorId: "u6",
    body: {
      text: "Reorganized the whole collection by mood instead of genre. No regrets.",
      entities: [],
    },
    mediaIds: ["m7"],
    reactionCounts: reactionCounts({ like: 7, wow: 2 }),
    commentCount: 1,
    shareCount: 0,
    createdAt: hoursAgo(58),
  },
  {
    id: "p22",
    authorId: "u7",
    body: {
      text: "Small wins: got through the whole inbox before lunch.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ like: 13, love: 3 }),
    commentCount: 0,
    shareCount: 0,
    createdAt: hoursAgo(64),
  },
  {
    id: "p23",
    authorId: "u8",
    body: {
      text: "Recovery day. Legs currently filing a formal complaint.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ haha: 24, like: 8 }),
    commentCount: 3,
    shareCount: 0,
    createdAt: hoursAgo(70),
  },
  {
    id: "p24",
    authorId: "u1",
    body: {
      text: "Old post to test pagination — if you're reading this, cursors work.",
      entities: [],
    },
    mediaIds: [],
    reactionCounts: reactionCounts({ like: 2 }),
    commentCount: 0,
    shareCount: 0,
    createdAt: hoursAgo(80),
  },
];

// The viewer's own reactions/shares — what data-access/services will use to
// derive `viewerReaction` / `viewerHasShared` per post. A few reactions from
// other users are included too, for texture; they aren't required to sum to
// the denormalized reactionCounts above (those are treated as the
// already-aggregated ground truth, the way a real feed DB would cache them).
export const reactions: DbReaction[] = [
  { postId: "p2", userId: VIEWER_ID, type: "love", createdAt: hoursAgo(2) },
  { postId: "p5", userId: VIEWER_ID, type: "like", createdAt: hoursAgo(5) },
  { postId: "p10", userId: VIEWER_ID, type: "haha", createdAt: hoursAgo(13) },
  { postId: "p1", userId: "u3", type: "like", createdAt: hoursAgo(1) },
  { postId: "p6", userId: "u2", type: "haha", createdAt: hoursAgo(6) },
];

export const shares: DbShare[] = [
  { postId: "p2", userId: VIEWER_ID, createdAt: hoursAgo(2) },
  { postId: "p11", userId: VIEWER_ID, createdAt: hoursAgo(15) },
  { postId: "p12", userId: "u2", createdAt: hoursAgo(17) },
];
