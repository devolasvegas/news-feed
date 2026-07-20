# News Feed Demo App

This is a news feed app, built to demonstrate some of the principles discussed in the article [News Feed (e.g. Facebook)](https://www.greatfrontend.com/interviews/study/one-month/questions/system-design/news-feed-facebook) from GreatFrontEnd, under the System Design category.

## Architecture

### Rendering

> For a personalized signed-in feed, the main benefit of rendering on the server is performance, not SEO. The content is already personalized, so search indexing is much less important than keeping the session interactive and responsive.
>
> That makes CSR the best default answer for the home feed. The feed is highly interactive, heavily personalized, and benefits from keeping state alive in the browser over a long-lived session.

### Navigation

> For a feed product, SPA is the stronger default. The biggest reason is shared client state. Most users open a post from the feed itself. In an SPA, the main post details such as text, media, and author data may already be in the store, so navigation to the post detail page can feel nearly instant, and only replies or comments need to be fetched after navigation.

### Architecture Layers

> With rendering and navigation decided, the front end can be broken down into four layers: View, Store, Data access, and Server.
>
> - View: This is what users interact with directly. It includes the feed page, post detail page, feed posts, and the post composer. The View layer renders data from the store and triggers user actions such as reacting to a post or composing a new one.
> - Store: The store is the source of truth for client-side state. It holds feed data, posts, users, composer state, optimistic updates, and freshness state. It keeps different parts of the interface consistent and lets the UI remain responsive even when the network is slow.
> - Data access: This layer abstracts communication with the backend APIs. It handles network requests, response parsing, caching policy, pagination, retries, and transformations that convert raw API responses into structures that are easy for the store to consume.
> - Server: The server exposes HTTP endpoints for fetching the feed, fetching a single post, creating posts, uploading media, and performing actions such as reactions and shares.

## Feed Pagination

> For a news feed, cursor-based pagination is the clear choice. It fits dynamic ordered feeds where new posts can be inserted, old posts can disappear, and ranking can change between requests, all while avoiding inconsistencies caused by real-time updates and scaling efficiently across large datasets.

## HTTP caching, deduplication, and idempotency

> The data access layer is where caching, coalescing, and write semantics get enforced across the API surface. Feed and single-post responses should carry short-lived Cache-Control headers with an ETag, so a revalidation round-trip becomes a cheap 304 Not Modified when nothing has changed. A stale-while-revalidate directive lets the client paint cached data immediately while a background fetch refreshes it, which is ideal when the user bounces from a post detail page back to the feed.
>
> In-flight request deduplication belongs in the data access layer too. If the composer fires two rapid reactions on the same post, or the user navigates away and back before a feed page resolves, the layer should coalesce identical requests and cancel superseded ones via AbortController. Mature query libraries like TanStack Query and Relay do this by default.
>
> Writes need idempotency keys. Post creation, reactions, and shares can be retried by the client, by the service worker after reconnect, or by a proxy on a flaky network, so the server should treat a key seen twice as the same write, returning the original result instead of creating a duplicate post. Generate the key on the client (e.g. a UUID attached to the request body or an Idempotency-Key header) at the moment the user submits, not at send time, so retries carry the original key.

## Project Structure

The four layers are implemented as private (underscore-prefixed) folders directly under `app/`, alongside the route handlers that make up the server layer:

```
app/
  layout.tsx
  page.tsx                        # renders <Feed /> from _view
  globals.css
  favicon.ico

  api/                             # 4. Server layer — route handlers
    feed/route.ts                  # GET  /api/feed            — fetch the feed (cursor-based pagination)
    posts/route.ts                 # POST /api/posts           — create a new post
    posts/[id]/route.ts            # GET  /api/posts/:id       — fetch a single post/permalink page
    posts/[id]/reaction/route.ts   # PUT  /api/posts/:id/reaction — set/change the viewer's reaction
                                    # DELETE /api/posts/:id/reaction — remove the viewer's reaction

  _server/                         # server-side business logic backing api/
    db/
      posts.ts                     # seed/mock "database"
      users.ts
    services/
      feedService.ts               # ranking + pagination + assembly
      postService.ts
      reactionService.ts
    types.ts

  _data-access/                    # 3. Data access layer — talks to the server
    client.ts                      # fetch wrapper: retries, in-flight de-dup, caching
    feedApi.ts                     # getFeed(cursor), createPost(body), setReaction(id, type), removeReaction(id)
    types.ts                       # DTOs matching server JSON shape

  _store/                          # 2. Store layer — client-side cache & state
    StoreProvider.tsx              # React context exposing the store
    FeedStore.ts                   # normalized entities: feeds, posts, users, media
    actions.ts                     # addPosts, setReaction (optimistic), addPost
    selectors.ts                   # getFeedPage(cursor), getPost(id)
    types.ts                       # entity/domain model: Post, User, Feed, Media, etc.

  _view/                           # 1. View layer — presentational components + hooks
    components/
      Feed.tsx
      FeedItem.tsx
      ReactionButton.tsx
      Composer.tsx
    hooks/
      useFeed.ts                   # bridges components <-> store, no fetching
    types.ts                       # view-model / component prop types
```

Comments are left out of this pass — no `posts/[id]/comments` route, comment service, or comment store slice yet.
