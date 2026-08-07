import Link from "next/link";

import type { PostBody } from "../types";

const entitiesMap: Record<
  string,
  (
    text: string,
    entity: {
      type: "mention" | "hashtag" | "link";
      start: number;
      end: number;
      userId?: string;
      url?: string;
    },
  ) => React.JSX.Element
> = {
  mention: (text, entity) => {
    return (
      <Link
        href={`/users/${entity.userId}`}
        key={`${entity.type}-${entity.start}-${entity.end}`}
      >
        {text}
      </Link>
    );
  },
  hashtag: (text, entity) => {
    return (
      <Link
        href={`/posts/hashtag/${text.replace(/^#/, "")}`}
        key={`${entity.type}-${entity.start}-${entity.end}`}
      >
        {text}
      </Link>
    );
  },
  link: (text, entity) => {
    return (
      <a
        href={entity.url}
        rel="noopener noreferrer"
        key={`${entity.type}-${entity.start}-${entity.end}`}
      >
        {text}
      </a>
    );
  },
};

export function PostBody({ body }: { body: PostBody }) {
  const result: Array<string | React.JSX.Element> = [];
  const sortedEntities: PostBody["entities"] = [...body.entities].sort(
    (a, b) => a.start - b.start,
  );

  let pointer = 0;
  for (let i = 0; i < sortedEntities.length; i++) {
    const entity = sortedEntities[i];
    const before = body.text.slice(pointer, entity.start);
    const entityText = body.text.slice(entity.start, entity.end);

    result.push(before, entitiesMap[entity.type](entityText, entity));
    pointer = entity.end;
  }

  result.push(body.text.slice(pointer));

  return result;
}
