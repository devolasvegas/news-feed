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

// Notes on the trickier ones:
// - loadFeed needs direction-aware merging: on direction: "older", append incoming postIds after the existing feed's and update only olderCursor/hasOlder; "newer" prepends and updates the newer side; no direction (first load) replaces wholesale. Entity maps (postsById/usersById/mediaById) always merge (spread over existing), never replace.
// - setReaction/clearReaction — recommend optimistic updates: write the new viewerReaction/engagementSummary to postsById immediately, then reconcile with (or roll back to the prior snapshot on failure from) the real ReactionError. Flag if you'd rather wait for the network response before touching state.
// - submitPost — drive composerDraft.submitState ("submitting" → "submitted" or "failed") since that's exactly what that field exists for; catch PostError internally rather than letting it throw.
// - loadFeed/loadPost have no analogous loading/error field on Feed/Post in the current types — recommend just letting those throw and having _view handle it locally, unless you want loading state added to the types too.
