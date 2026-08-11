'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PenLine } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';

/**
 * The Sanctuary, for a signed-in member.
 *
 * Different from `/sanctuary` on the public site in one respect that matters:
 * this listing also returns the caller's *own* unpublished work. An author who
 * submits an article and then cannot see it anywhere reasonably concludes it
 * vanished — so pending and rejected articles appear here, with their status,
 * and only to the person who wrote them.
 *
 * The listing carries no article text. `content` is capped at 100,000
 * characters and the cards show a title and a preview line, so the API sends a
 * server-cut excerpt and the reader fetches the article by id. See
 * `EXCERPT_CHARS` in the backend's routes/blogs.js.
 */

type Blog = {
  _id: string;
  title: string;
  excerpt?: string;
  category?: string;
  authorName?: string;
  status?: 'published' | 'pending' | 'rejected';
  reviewNote?: string;
  likes?: string[];
  createdAt: string;
};

const STATUS_LABEL = {
  published: 'Published',
  pending: 'Awaiting approval',
  rejected: 'Not approved',
} as const;

export default function BlogsPage() {
  const [writing, setWriting] = useState(false);

  const state = useApi(
    () => api.get<Paged<Blog, 'blogs'>>('/api/blogs', { limit: 30 }),
    []
  );

  return (
    <>
      <PageHeader
        title="Sanctuary"
        subtitle="Writing by members, reviewed before it publishes. Your own drafts appear here too."
        action={
          <button
            type="button"
            onClick={() => setWriting((value) => !value)}
            className={writing ? 'btn-ghost !py-2.5' : 'btn-primary !py-2.5'}
          >
            {writing ? 'Cancel' : <><PenLine className="h-4 w-4" /> Write</>}
          </button>
        }
      />

      {writing && (
        <Composer
          onDone={async () => {
            setWriting(false);
            await state.reload();
          }}
        />
      )}

      <AsyncSection state={state}>
        {(data) =>
          data.blogs.length === 0 ? (
            <EmptyState
              title="Nothing published yet"
              body="Articles are written by members and reviewed before they appear. If you have something worth saying about getting through a hard stretch, write it."
              action={
                <button
                  type="button"
                  onClick={() => setWriting(true)}
                  className="btn-primary"
                >
                  Write the first one
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data.blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/app/blogs/${blog._id}`}
                  className="glass glass-hover block p-5"
                >
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {blog.category && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                        {blog.category}
                      </span>
                    )}
                    {blog.status && blog.status !== 'published' && (
                      <span
                        className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold ${
                          blog.status === 'rejected'
                            ? 'bg-danger/20 text-red-300'
                            : 'bg-accent/20 text-accent'
                        }`}
                      >
                        {STATUS_LABEL[blog.status]}
                      </span>
                    )}
                  </div>

                  <h2 className="text-[15.5px] font-semibold leading-snug text-ink-primary">
                    {blog.title}
                  </h2>

                  {blog.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-secondary">
                      {blog.excerpt}
                    </p>
                  )}

                  <p className="mt-3 text-[11px] text-ink-muted">
                    {blog.authorName || 'A member'} · {timeAgo(blog.createdAt)}
                    {blog.likes?.length ? ` · ${blog.likes.length} likes` : ''}
                  </p>

                  {/* The reason, to whoever it is for. The author needs it to
                      act on; without it a rejection is just a closed door. */}
                  {blog.status === 'rejected' && blog.reviewNote && (
                    <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] leading-relaxed text-ink-secondary">
                      {blog.reviewNote}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )
        }
      </AsyncSection>
    </>
  );
}

function Composer({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    setError(null);

    try {
      // No author and no status. Both are the server's: it takes the author
      // from the verified token and decides whether this publishes or queues
      // from the `admin` claim in that same token.
      await api.post('/api/blogs', {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-5">
      <div className="space-y-3">
        <div>
          <label htmlFor="blog-title" className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            Title
          </label>
          <input
            id="blog-title"
            className="field"
            value={title}
            maxLength={300}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Why the loop gets louder at night"
          />
        </div>

        <div>
          <label htmlFor="blog-category" className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            Category
          </label>
          <input
            id="blog-category"
            className="field"
            value={category}
            maxLength={60}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Anxiety, Habits, Sleep…"
          />
        </div>

        <div>
          <label htmlFor="blog-content" className="mb-1.5 block text-[12px] font-medium text-ink-secondary">
            The article
          </label>
          <textarea
            id="blog-content"
            rows={12}
            className="field resize-y"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write it the way you would say it to somebody. Leave a blank line between paragraphs."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-ink-secondary">
          {error}
        </p>
      )}

      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
        A human reads every submission. If it is turned down you get a written
        reason and you keep the draft.
      </p>

      <button
        type="button"
        onClick={submit}
        disabled={busy || !title.trim() || !content.trim()}
        className="btn-primary mt-4 w-full"
      >
        {busy ? 'Submitting…' : 'Submit for review'}
      </button>
    </Card>
  );
}
