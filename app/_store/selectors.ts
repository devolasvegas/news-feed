// Raw slices (state.postsById[id]) are directly selectable from the zustand store, but joining a feed's postIds into full {post, author, media} objects is a repeated concern worth centralizing:

// function useFeedPosts(feedId: string): Array<{ post: Post; author: User; media: Media[] }> | undefined
// function usePostDetail(postId: string): { post: Post; author: User; media: Media[] } | undefined

// Use useShallow (zustand's built-in) on these to avoid new-object-per-render re-renders.
import { useShallow } from "zustand/shallow";

import { useFeedStore } from "./store";
import type { Post, User, Media } from "./types";

export function useFeedPosts(
  feedId: string,
): Array<{ post: Post; author: User; media: Media[] }> | undefined {
  return useFeedStore(
    useShallow((state) => {
      const feed = state.feedsById[feedId];

      if (!feed) return undefined;

      // return a de-normalized feed list by mapping over the current feed
      return feed.postIds.map((postId) => {
        const post = state.postsById[postId];

        return {
          post,
          author: state.usersById[post.authorId],
          media: post.mediaIds.map((id) => state.mediaById[id]),
        };
      });
    }),
  );
}
