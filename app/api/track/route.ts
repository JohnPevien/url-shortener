import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { analytics, links } from '@/lib/schema';
import { UAParser } from 'ua-parser-js';

const trackSchema = z.object({
  slug: z.string().min(1).max(64),
  country: z.string().max(64).nullish(),
  city: z.string().max(64).nullish(),
  userAgent: z.string().max(1024).nullish(),
  referrer: z.string().max(2048).nullish(),
});

export async function POST(req: Request) {
  const secret = req.headers.get('x-secret-key');
  if (!process.env.TRACKING_SECRET || secret !== process.env.TRACKING_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parsed = trackSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { slug, country, city, userAgent, referrer } = parsed.data;

    // Spoofed analytics for nonexistent slugs are rejected before insert.
    const existing = await db
      .select({ slug: links.slug })
      .from(links)
      .where(eq(links.slug, slug))
      .limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Unknown slug' }, { status: 404 });
    }

    const parser = new UAParser(userAgent ?? undefined);
    const result = parser.getResult();

    const browserName = result.browser.name || 'Unknown';
    const deviceType = result.device.type || 'desktop';
    const osName = result.os.name || 'Unknown';

    await db.insert(analytics).values({
      slug: slug,
      country: country || 'Unknown',
      city: city || 'Unknown',
      device: deviceType === 'mobile' ? 'Mobile' : 'Desktop',
      browser: browserName,
      os: osName,
      referrer: referrer || 'Direct',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics Tracking Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
