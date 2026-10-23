import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@libsql/client/web';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Only http(s) destinations are ever served; anything else 404s.
function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAdminAuthorized(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const header = req.headers.get('x-admin-token');
  const cookie = req.cookies.get('admin_token')?.value;
  return header === token || cookie === token;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    if (!isAdminAuthorized(req)) {
      return NextResponse.rewrite(new URL('/404', req.url));
    }
    return NextResponse.next();
  }

  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/' ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const slug = url.pathname.slice(1);

  try {
    const result = await turso.execute({
      sql: 'SELECT url FROM links WHERE slug = ? AND is_active = 1 LIMIT 1',
      args: [slug],
    });

    const link = result.rows[0];

    if (!link || !isHttpUrl(link.url)) {
      return NextResponse.rewrite(new URL('/404', req.url));
    }

    fetch(`${url.origin}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': process.env.TRACKING_SECRET!,
      },
      body: JSON.stringify({
        slug: slug,
        country: (req as NextRequest & { geo?: { country?: string; city?: string } }).geo?.country || 'Unknown',
        city: (req as NextRequest & { geo?: { country?: string; city?: string } }).geo?.city || 'Unknown',
        userAgent: req.headers.get('user-agent'),
        referrer: req.headers.get('referer') || 'Direct',
      }),
    }).catch((err) => console.error('Tracking failed', err));

    return NextResponse.redirect(new URL(link.url), { status: 307 });
  } catch (error) {
    console.error('Middleware Error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
