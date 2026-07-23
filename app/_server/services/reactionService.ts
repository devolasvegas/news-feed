import { posts, reactions } from "../db/posts";
import { type DbReaction, type ReactionType } from "../types";
import { toPostDTO, type PostDTO } from "../dto";

// Set/change viewer's reaction
export async function upsertReaction(
  postId: string,
  viewerId: string,
  type: ReactionType,
): Promise<PostDTO | null> {
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return null;
  }

  const newReaction: DbReaction = {
    postId,
    userId: viewerId,
    type,
    createdAt: Date.now(),
  };

  const existingIndex = reactions.findIndex(
    (r) => r.postId === postId && r.userId === viewerId,
  );

  if (existingIndex === -1) {
    // Insert new reaction
    reactions.push(newReaction);
    post.reactionCounts[type] += 1;
  } else {
    // Update existing reaction
    const existingReactionType = reactions[existingIndex].type;
    reactions[existingIndex] = newReaction;

    // If the new type isn't the same as the old type
    if (existingReactionType !== type) {
      // Decrement the old type
      post.reactionCounts[existingReactionType] -= 1;
      // Increment the new type
      post.reactionCounts[type] += 1;
    }
  }

  return toPostDTO(post, viewerId);
}

// Delete viewer's reaction
export async function deleteReaction(
  postId: string,
  viewerId: string,
): Promise<PostDTO | null> {
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return null;
  }

  const existingIndex = reactions.findIndex(
    (r) => r.postId === postId && r.userId === viewerId,
  );

  if (existingIndex !== -1) {
    // Delete existing reaction
    const existingReactionType = reactions[existingIndex].type;
    reactions.splice(existingIndex, 1);

    // And decrement the count for that type
    post.reactionCounts[existingReactionType] -= 1;
  }

  return toPostDTO(post, viewerId);
}
