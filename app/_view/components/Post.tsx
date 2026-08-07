import Image from "next/image";

import { PostBody } from "./PostBody";
import type { PostProps } from "../types";

export function Post({ post, author, media }: PostProps) {
  const createdAtDate = new Date(post.createdAt);
  return (
    <article className="flex flex-col gap-3 border-b border-zinc-200 py-4 dark:border-zinc-800">
      <header className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image
            src={author.profilePhotoUrl}
            alt={author.name}
            fill
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {author.name}
            </span>

            {/* conditionally render a verified badge when author.isVerified */}
          </div>

          <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>@{author.handle}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={createdAtDate.toISOString()}>
              {Intl.DateTimeFormat("en-us").format(createdAtDate)}
            </time>
          </div>
        </div>
      </header>

      <p className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
        <PostBody body={post.body} />
      </p>

      {/* only render when media.length > 0 — map over `media`, rendering an <img> per item using src/alt/width/height */}
      <div className="grid gap-2 overflow-hidden rounded-lg sm:grid-cols-2"></div>

      <footer className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span>{/* post.engagementSummary.totalReactions */} reactions</span>
        <span>{/* post.engagementSummary.commentCount */} comments</span>
        <span>{/* post.engagementSummary.shareCount */} shares</span>
      </footer>
    </article>
  );
}
