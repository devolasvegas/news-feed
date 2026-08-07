import type { Post, User, Media } from "../_store/types";

export type PostProps = {
  post: Post;
  author: User;
  media: Media[];
};
export type PostBody = {
  text: string;
  entities: Array<{
    type: "mention" | "hashtag" | "link";
    start: number;
    end: number;
    userId?: string;
    url?: string;
  }>;
};
