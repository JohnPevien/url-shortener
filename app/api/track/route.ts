import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analytics } from '@/lib/schema';
import { UAParser } from 'ua-parser-js';

export async function POST(req: Request) {
  const secret = req.headers.get('x-secret-key');
  if (secret !== process.env.TRACKING_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { slug, country, city, userAgent, referrer } = body;

    const parser = new UAParser(userAgent);
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
