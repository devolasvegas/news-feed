import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { useFeedStore } from "./store";
import type { Post, User, Media } from "./types";

export function useFeedPosts(
  feedId: string,
): Array<{ post: Post; author: User; media: Media[] }> | undefined {
  const { postIds, postsById, usersById, mediaById } = useFeedStore(
    useShallow((state) => ({
      postIds: state.feedsById[feedId]?.postIds,
      postsById: state.postsById,
      usersById: state.usersById,
      mediaById: state.mediaById,
    })),
  );

  return useMemo(() => {
    if (!postIds) return undefined;

    return postIds.map((postId) => {
      const post = postsById[postId];
      return {
        post,
        author: usersById[post.authorId],
        media: post.mediaIds.map((id) => mediaById[id]),
      };
    });
  }, [postIds, postsById, usersById, mediaById]);
}

export function usePostDetail(
  postId: string,
): { post: Post; author: User; media: Media[] } | undefined {
  const { post, usersById, mediaById } = useFeedStore(
    useShallow((state) => ({
      post: state.postsById[postId],
      usersById: state.usersById,
      mediaById: state.mediaById,
    })),
  );

  return useMemo(() => {
    if (!post) return undefined;

    return {
      post,
      author: usersById[post.authorId],
      media: post.mediaIds.map((id) => mediaById[id]),
    };
  }, [post, usersById, mediaById]);
}
