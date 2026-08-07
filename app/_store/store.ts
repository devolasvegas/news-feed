import { create } from "zustand";

import { type ReactionType } from "../_data-access/types";
import { type FetchFeedParams, fetchFeed } from "../_data-access/feed";
import {
  deleteReaction,
  ReactionError,
  upsertReaction,
} from "../_data-access/reaction";
import {
  type CreatePostParams,
  PostError,
  fetchPost,
  createPost,
} from "../_data-access/post";
import { type ComposerDraft, type Store, type Post } from "./types";
import {
  normalizeFeedPage,
  normalizePostDetail,
  toStorePost,
} from "./normalize";

// State = the existing Store type. Actions live alongside it in the same create<Store & StoreActions>():

type StoreActions = {
  loadFeed(feedId: string, params: FetchFeedParams): Promise<void>;
  loadPost(postId: string, viewerId: string): Promise<void>;
  submitPost(feedId: string | null, params: CreatePostParams): Promise<void>;
  setReaction(
    postId: string,
    viewerId: string,
    type: ReactionType,
  ): Promise<void>;
  clearReaction(postId: string, viewerId: string): Promise<void>;
  updateComposerDraft(patch: Partial<ComposerDraft>): void;
  resetComposerDraft(): void;
};

export const useFeedStore = create<Store & StoreActions>()((set) => ({
  feedsById: {},
  postsById: {},
  usersById: {},
  mediaById: {},
  composerDraft: {
    body: {
      text: "",
      entities: [],
    },
    mediaIds: [],
    uploadState: "idle",
    submitState: "idle",
  },
  loadFeed: async (feedId, params) => {
    const response = await fetchFeed(params); // _data-access
    const { posts, authors, media, postIds, pageInfo } =
      normalizeFeedPage(response); // normalize.ts

    set((state) => {
      const existingFeed = state.feedsById[feedId];

      const mergedPostIds =
        params.direction === "older"
          ? [...(existingFeed?.postIds ?? []), ...postIds] // append
          : params.direction === "newer"
            ? [...postIds, ...(existingFeed?.postIds ?? [])] // prepend
            : postIds; // first load: replace

      return {
        postsById: { ...state.postsById, ...posts },
        usersById: { ...state.usersById, ...authors },
        mediaById: { ...state.mediaById, ...media },
        feedsById: {
          ...state.feedsById,
          [feedId]: {
            id: feedId,
            postIds: mergedPostIds,
            olderCursor:
              params.direction === "newer"
                ? (existingFeed?.olderCursor ?? null)
                : pageInfo.olderCursor,
            newerCursor:
              params.direction === "older"
                ? (existingFeed?.newerCursor ?? null)
                : pageInfo.newerCursor,
            hasOlder:
              params.direction === "newer"
                ? (existingFeed?.hasOlder ?? false)
                : pageInfo.hasOlder,
            hasNewer:
              params.direction === "older"
                ? (existingFeed?.hasNewer ?? false)
                : pageInfo.hasNewer,
            lastFetchedAt: Date.now(),
          },
        },
      };
    });
  },
  loadPost: async (postId, viewerId) => {
    const response = await fetchPost(postId, viewerId);
    const { author, post, media } = normalizePostDetail(response);

    set((state) => ({
      postsById: { ...state.postsById, [post.id]: post },
      usersById: { ...state.usersById, [author.id]: author },
      mediaById: { ...state.mediaById, ...media },
    }));
  },
  submitPost: async (feedId, params) => {
    set((state) => ({
      composerDraft: { ...state.composerDraft, submitState: "submitting" },
    }));

    try {
      const response = await createPost(params);
      const { author, post, media } = normalizePostDetail(response);

      set((state) => ({
        postsById: { ...state.postsById, [post.id]: post },
        usersById: { ...state.usersById, [author.id]: author },
        mediaById: { ...state.mediaById, ...media },
        composerDraft: { ...state.composerDraft, submitState: "submitted" },
        feedsById:
          feedId && state.feedsById[feedId] // If feedId already exists in state …
            ? {
                // … Update that feedId
                ...state.feedsById,
                [feedId]: {
                  ...state.feedsById[feedId],
                  postIds: [post.id, ...state.feedsById[feedId].postIds],
                },
              }
            : state.feedsById,
      }));
    } catch (err) {
      set((state) => ({
        composerDraft: { ...state.composerDraft, submitState: "failed" },
      }));
      if (!(err instanceof PostError)) throw err;
    }
  },
  setReaction: async (postId, viewerId, type) => {
    let post: Post;
    let prevReactionType: ReactionType | null = null;

    // Optimistically update state with new reaction type
    set((state) => {
      post = state.postsById[postId];
      prevReactionType = post.viewerReaction;
      const prevReactions = post.engagementSummary.reactions;

      if (prevReactionType === type) return {}; // no-op if new selected reaction matches previous reaction

      // Make a copy of existing reactions and increment new chosen reaction
      const reactions = {
        ...prevReactions,
        [type]: post.engagementSummary.reactions[type] + 1,
      };

      let totalReactions = post.engagementSummary.totalReactions;

      if (prevReactionType) {
        // Decrement old reaction type
        reactions[prevReactionType] -= 1;
      } else {
        // Increment totalReactions only if there is no previous reaction from this user.
        totalReactions += 1;
      }

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            // Rebuild the post, spreading in our new values.
            ...post,
            viewerReaction: type,
            engagementSummary: {
              ...post.engagementSummary,
              reactions,
              totalReactions,
            },
          },
        },
      };
    });

    if (prevReactionType === type) return;

    try {
      const response = await upsertReaction(postId, viewerId, type);
      post = toStorePost(response);

      set((state) => ({
        postsById: { ...state.postsById, [postId]: post },
      }));
    } catch (err) {
      // If `post` isn't updated in the `try`, the old post data are put back in and optimistic updates are rolled back.
      set((state) => ({
        postsById: { ...state.postsById, [postId]: post },
      }));
      if (!(err instanceof ReactionError)) throw err;
    }
  },
  clearReaction: async (postId, viewerId) => {
    let post: Post;
    let prevReactionType: ReactionType | null = null;

    // Optimistic update to post
    set((state) => {
      post = state.postsById[postId];
      prevReactionType = post.viewerReaction;
      const prevReactions = post.engagementSummary.reactions;

      if (!prevReactionType) {
        return {};
      }

      const reactions = {
        ...prevReactions,
        [prevReactionType]:
          post.engagementSummary.reactions[prevReactionType] - 1,
      };

      const totalReactions = post.engagementSummary.totalReactions - 1;

      return {
        postsById: {
          ...state.postsById,
          [postId]: {
            // Rebuild the post, spreading in our new values.
            ...post,
            viewerReaction: null,
            engagementSummary: {
              ...post.engagementSummary,
              reactions,
              totalReactions,
            },
          },
        },
      };
    });

    if (!prevReactionType) return;

    try {
      const response = await deleteReaction(postId, viewerId);
      post = toStorePost(response);

      set((state) => ({
        postsById: { ...state.postsById, [postId]: post },
      }));
    } catch (err) {
      // If `post` isn't updated in the `try`, the old post data are put back in and optimistic updates are rolled back.
      set((state) => ({
        postsById: { ...state.postsById, [postId]: post },
      }));
      if (!(err instanceof ReactionError)) throw err;
    }
  },
  updateComposerDraft: () => {},
  resetComposerDraft: () => {},
}));

// Notes on the trickier ones:
// - setReaction/clearReaction — recommend optimistic updates: write the new viewerReaction/engagementSummary to postsById immediately, then reconcile with (or roll back to the prior snapshot on failure from) the real ReactionError. Flag if you'd rather wait for the network response before touching state.
