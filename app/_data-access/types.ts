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

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";
