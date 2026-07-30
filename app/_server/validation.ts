import { PostBody } from "./types";

export function isValidEntity(
  entity: unknown,
  textLength: number,
): entity is PostBody["entities"][number] {
  if (typeof entity !== "object" || entity === null) return false;
  const e = entity as Record<string, unknown>;

  if (typeof e.start !== "number" || typeof e.end !== "number") return false;
  if (e.start < 0 || e.end <= e.start || e.end > textLength) return false;

  switch (e.type) {
    case "mention":
      return typeof e.userId === "string";
    case "hashtag":
      return true;
    case "link":
      return typeof e.url === "string";
    default:
      return false;
  }
}
