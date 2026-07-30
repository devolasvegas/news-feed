import { posts, reactionCounts } from "../db/posts";
import {
  getMediaByIds,
  getAuthorOrThrow,
  toAuthorDTO,
  toPostDTO,
  type AuthorDTO,
  type MediaDTO,
  type PostDTO,
} from "../dto";
import { DbPost, PostBody } from "../types";

export type PostDetail = {
  post: PostDTO;
  author: AuthorDTO;
  media: MediaDTO[];
};

export type CreatePostParams = {
  authorId: string;
  body: PostBody;
  mediaIds?: string[];
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

export async function createPost({
  authorId,
  body,
  mediaIds,
}: CreatePostParams): Promise<PostDetail> {
  const author = await getAuthorOrThrow(authorId);
  const newPost: DbPost = {
    id: crypto.randomUUID(),
    authorId,
    body,
    mediaIds: mediaIds ?? [],
    reactionCounts: reactionCounts({}),
    commentCount: 0,
    shareCount: 0,
    createdAt: Date.now(),
  };

  posts.push(newPost);

  const postMedia = await getMediaByIds(newPost.mediaIds);
  const authorDto = toAuthorDTO(author, authorId);
  const postDto = toPostDTO(newPost, authorId);

  return {
    post: postDto,
    author: authorDto,
    media: postMedia,
  };
}
