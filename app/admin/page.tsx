import { headers, cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { links } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { CreateLinkDialog } from './_components/create-link-dialog';

export const revalidate = 0; // Disable caching for the admin dashboard

export default async function AdminDashboard() {
  // Defense in depth: middleware gates /admin, but re-check here so the
  // dashboard never renders without the env-configured admin token.
  const adminToken = process.env.ADMIN_TOKEN;
  const headerStore = await headers();
  const cookieStore = await cookies();
  if (
    !adminToken ||
    (headerStore.get('x-admin-token') !== adminToken &&
      cookieStore.get('admin_token')?.value !== adminToken)
  ) {
    notFound();
  }
  // Fetch links from Turso database, ordering by latest first
  const allLinks = await db.select().from(links).orderBy(desc(links.createdAt));

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Links</h1>
          <p className="text-sm text-muted-foreground">
            Manage your shortened URLs here.
          </p>
        </div>
        <CreateLinkDialog />
      </div>

      <div className="mt-4 rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No links found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              allLinks.map((link) => (
                <TableRow key={link.slug}>
                  <TableCell className="font-medium max-w-[150px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate">/{link.slug}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy short link</span>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate sm:max-w-[300px]">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span className="truncate">{link.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    {link.createdAt
                      ? new Date(link.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
