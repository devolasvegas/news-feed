// Raw slices (state.postsById[id]) are directly selectable from the zustand store, but joining a feed's postIds into full {post, author, media} objects is a repeated concern worth centralizing:

// function useFeedPosts(feedId: string): Array<{ post: Post; author: User; media: Media[] }> | undefined
// function usePostDetail(postId: string): { post: Post; author: User; media: Media[] } | undefined

// Use useShallow (zustand's built-in) on these to avoid new-object-per-render re-renders.
