import { posts } from "../db/posts";
import {
  getMediaByIds,
  getAuthorOrThrow,
  toAuthorDTO,
  toPostDTO,
  type AuthorDTO,
  type MediaDTO,
  type PostDTO,
} from "../dto";

export type PostDetail = {
  post: PostDTO;
  author: AuthorDTO;
  media: MediaDTO[];
};

export async function getPostById(
  postId: string,
  viewerId: string,
): Promise<PostDetail | null> {
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return null;
  }

  const authorId = post.authorId;

  const author = await getAuthorOrThrow(authorId);

  const postMedia = await getMediaByIds(post.mediaIds);

  return {
    post: toPostDTO(post, viewerId),
    author: toAuthorDTO(author, viewerId),
    media: postMedia,
  };
}
