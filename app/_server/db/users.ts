import type { DbRelationshipEdge, DbUser } from "../types";

// No auth layer yet — this is the stand-in "currently signed in" user that
// relationship edges and reactions/shares are seeded relative to.
export const VIEWER_ID = "u1";

export const users: DbUser[] = [
  {
    id: "u1",
    name: "Ava Chen",
    handle: "ava",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=ava",
    isVerified: false,
  },
  {
    id: "u2",
    name: "Marcus Webb",
    handle: "marcusw",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=marcusw",
    isVerified: false,
  },
  {
    id: "u3",
    name: "Priya Patel",
    handle: "priyap",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=priyap",
    isVerified: true,
  },
  {
    id: "u4",
    name: "Jordan Lee",
    handle: "jordanlee",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=jordanlee",
    isVerified: false,
  },
  {
    id: "u5",
    name: "Sofia Torres",
    handle: "sofiat",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=sofiat",
    isVerified: false,
  },
  {
    id: "u6",
    name: "Ben Okafor",
    handle: "benok",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=benok",
    isVerified: false,
  },
  {
    id: "u7",
    name: "Nadia Ibrahim",
    handle: "nadiai",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=nadiai",
    isVerified: true,
  },
  {
    id: "u8",
    name: "Tom Richter",
    handle: "tomr",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=tomr",
    isVerified: false,
  },
];

// Relative to VIEWER_ID. u6 and u8 are intentionally left as strangers (no
// edges at all) to exercise the "no relationship" case.
export const relationshipEdges: DbRelationshipEdge[] = [
  { viewerId: VIEWER_ID, targetUserId: "u2", type: "friend" },
  { viewerId: VIEWER_ID, targetUserId: "u3", type: "friend" },
  { viewerId: VIEWER_ID, targetUserId: "u3", type: "following" },
  { viewerId: VIEWER_ID, targetUserId: "u4", type: "following" },
  { viewerId: VIEWER_ID, targetUserId: "u5", type: "muted" },
  { viewerId: VIEWER_ID, targetUserId: "u7", type: "blocked" },
];
