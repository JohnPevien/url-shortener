# Milestone 2: Edge Redirect Engine & Analytics Tracking

## Summary
Implemented the core redirect middleware that intercepts slug requests and redirects users to destination URLs. Analytics are tracked asynchronously via a fire-and-forget API call.

## Files Involved

### [middleware.ts](file:///c:/code/github-repositories/url-shortener/middleware.ts)
- **Purpose**: Edge middleware that handles all slug lookups and redirects.
- **Details**:
    - Uses `@libsql/client/web` for Edge-compatible Turso queries.
    - Queries the nearest Turso replica for the slug.
    - Returns 307 Temporary Redirect if found.
    - Rewrites to `/404` if slug not found.
    - Fires analytics tracking in the background (non-blocking).

### [app/api/track/route.ts](file:///c:/code/github-repositories/url-shortener/app/api/track/route.ts)
- **Purpose**: API route for recording click analytics.
- **Details**:
    - Validates requests using `TRACKING_SECRET` header.
    - Parses User-Agent to extract browser, device, and OS.
    - Writes analytics data to the primary Turso database.

## Architecture Notes

### Latency Optimization
- The middleware uses `@libsql/client/web` which is HTTP-based and works in Edge Runtime.
- Reads go to the nearest Turso replica (eventual consistency).
- Writes go to the primary database (Singapore).

### Security
- The `/api/track` endpoint is protected by `x-secret-key` header validation.
- `TRACKING_SECRET` must be set in `.env.local`.

## Verification Steps
1. Start the dev server: `pnpm dev`
2. Add a test link to your database manually (or via the upcoming admin dashboard).
3. Visit `localhost:3000/[your-slug]` and verify the redirect works.
4. Check your Turso database to see if analytics were recorded.

## Next Steps (Milestone 3)
- Build the Admin Dashboard for link management (Create/Edit/Delete links).
- Add the "Create Link" form with Shadcn UI components.
