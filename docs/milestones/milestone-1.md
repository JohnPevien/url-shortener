# Milestone 1: Database & Schema Setup

## Summary
In this milestone, we set up the foundation for the URL shortener's data layer. We configured the Turso database connection and defined the Drizzle ORM schema for managing links and analytics.

## Files Involved

### [lib/db.ts](file:///c:/code/github-repositories/url-shortener/lib/db.ts)
- **Purpose**: Initializes the Turso client and Drizzle ORM instance. 
- **Details**: Uses `@libsql/client` for edge-compatible database communication.

### [lib/schema.ts](file:///c:/code/github-repositories/url-shortener/lib/schema.ts)
- **Purpose**: Defines the database tables and relationships.
- **Details**:
    - `links`: Stores slugs, destination URLs, and metadata.
    - `analytics`: Stores click details including location, device, and browser information.

### [drizzle.config.ts](file:///c:/code/github-repositories/url-shortener/drizzle.config.ts)
- **Purpose**: Configuration for Drizzle Kit.
- **Details**: Defines the schema location, output directory for migrations, and database credentials. It is configured to explicitly load `.env.local` to match Next.js environment standards.

### [.env.local](file:///c:/code/github-repositories/url-shortener/.env.local)
- **Purpose**: Stores sensitive credentials.
- **Details**: Contains `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `TRACKING_SECRET`.

### [env.example](file:///c:/code/github-repositories/url-shortener/env.example)
- **Purpose**: A template for required environment variables.

## Verification Steps
1. Run `pnpm drizzle-kit push` to synchronize the schema with your Turso database.
2. Verify that tables `links` and `analytics` are created in your Turso dashboard.

## Suggested Commit Message
`feat: add turso database and drizzle schema`
