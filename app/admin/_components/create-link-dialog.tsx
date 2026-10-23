'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(64).regex(/^[a-zA-Z0-9_-]+$/, 'Slug must be alphanumeric, dashes, or underscores'),
  // Write-path allowlist mirrors middleware: only http(s) destinations.
  url: z.string().min(1).max(2048).refine(
    (v) => {
      try {
        const parsed = new URL(v);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    'Only http(s) URLs are allowed',
  ),
});

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: '',
      url: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Basic implementation for UI demonstration; wiring to Server Action later.
    console.log("Submitted Link:", values);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Short Link</DialogTitle>
          <DialogDescription>
            Enter a destination URL and your desired custom slug.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/very/long/url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-link" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be your short URL: yourdomain.com/slug
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
