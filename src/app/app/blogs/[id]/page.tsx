'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Flag, Heart, Send } from 'lucide-react';

import {
  AsyncSection,
  Card,
  PageHeader,
  timeAgo,
  useApi,
} from '@/components/app/ui';
import { ReportDialog, type ReportTarget } from '@/components/app/ReportDialog';
import { api, type Paged } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Blog = {
  _id: string;
  /** Author's uid. Empty on articles that predate member authorship. */
  uid?: string;
  title: string;
  titleHinglish?: string;
  content: string;
  contentHinglish?: string;
  category?: string;
  authorName?: string;
  likes?: string[];
  sharesCount?: number;
  createdAt: string;
};

type Comment = {
  _id: string;
  uid?: string;
  authorName?: string;
  content: string;
  createdAt: string;
};

/**
 * One article, with its comments.
 *
 * Fetched by id rather than found in the listing. The Flutter app used to
 * subscribe to the whole `blogs` collection to display a single post — reading
 * the entire Sanctuary to render one page — and the listing does not carry
 * article bodies any more regardless.
 *
 * The body is rendered as text with paragraph breaks preserved, never as HTML.
 * These are written by members through a plain-text editor, and passing that
 * through `dangerouslySetInnerHTML` would make an approved author's article a
 * stored-XSS vector whose only review step is one person skim-reading prose.
 */
export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const [hinglish, setHinglish] = useState(false);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  /**
   * What the flag opens, rather than what it posts.
   *
   * The button used to post immediately, with `contentKind: 'article'` — a fifth
   * kind neither the app nor the moderation inbox has ever known about, so a
   * report filed from this page arrived in the queue as an unrecognised row that
   * the inbox could not open. The app files articles as `'blog'` and comments as
   * `'comment'`; two clients using different words for the same object is how a
   * moderation queue quietly stops being one queue.
   */
  const [reporting, setReporting] = useState<ReportTarget | null>(null);

  const article = useApi(
    () => api.get<{ blog: Blog }>(`/api/blogs/${id}`),
    [id]
  );
  const comments = useApi(
    () =>
      api.get<Paged<Comment, 'comments'>>(`/api/blogs/${id}/comments`, {
        limit: 50,
      }),
    [id]
  );

  const liked = Boolean(
    user && article.data?.blog.likes?.includes(user.uid)
  );

  async function toggleLike() {
    if (!article.data) return;
    try {
      // Two endpoints rather than a read-modify-write of the array: editing the
      // list client-side and writing it back loses a like when two people tap
      // at once, and a counter that goes backwards is what people notice.
      if (liked) await api.delete(`/api/blogs/${id}/like`);
      else await api.post(`/api/blogs/${id}/like`);
      await article.reload();
    } catch {
      // Leave the count as it was.
    }
  }

  async function postComment() {
    const content = comment.trim();
    if (!content) return;
    setSending(true);
    try {
      // Name and email come off the verified token server-side.
      await api.post(`/api/blogs/${id}/comments`, { content });
      setComment('');
      await comments.reload();
    } finally {
      setSending(false);
    }
  }


  return (
    <>
      <Link
        href="/app/blogs"
        className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted transition hover:text-ink-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Sanctuary
      </Link>

      <AsyncSection state={article}>
        {(data) => {
          const blog = data.blog;
          const showHinglish = hinglish && Boolean(blog.contentHinglish);
          const body = showHinglish ? blog.contentHinglish! : blog.content;

          return (
            <>
              <PageHeader
                title={showHinglish ? blog.titleHinglish || blog.title : blog.title}
                subtitle={`${blog.authorName || 'A member'} · ${timeAgo(blog.createdAt)}${
                  blog.category ? ` · ${blog.category}` : ''
                }`}
              />

              {blog.contentHinglish && (
                <div className="mb-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHinglish(false)}
                    className={`rounded-pill px-4 py-1.5 text-[12px] font-medium transition ${
                      !hinglish
                        ? 'bg-gradient-primary text-white'
                        : 'border border-hairline text-ink-secondary'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setHinglish(true)}
                    className={`rounded-pill px-4 py-1.5 text-[12px] font-medium transition ${
                      hinglish
                        ? 'bg-gradient-primary text-white'
                        : 'border border-hairline text-ink-secondary'
                    }`}
                  >
                    Hinglish
                  </button>
                </div>
              )}

              <Card>
                <div className="prose-innen">
                  {body
                    .split(/\n{2,}/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>

                <div className="mt-6 flex items-center gap-4 border-t border-hairline pt-4">
                  <button
                    type="button"
                    onClick={toggleLike}
                    className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-secondary transition hover:text-ink-primary"
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? 'fill-red-400 text-red-400' : ''}`}
                    />
                    {blog.likes?.length ?? 0}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReporting({
                        contentKind: 'blog',
                        contentId: id,
                        // Empty on articles that predate member authorship —
                        // sent as null rather than as '', so the queue does not
                        // show a report attributed to a uid nobody has.
                        reportedUid: blog.uid || null,
                        excerpt: `${blog.title}\n\n${body}`,
                      })
                    }
                    className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition hover:text-accent"
                  >
                    <Flag className="h-3.5 w-3.5" /> Report
                  </button>
                </div>
              </Card>

              <h2 className="mb-3 mt-8 text-[13px] font-semibold uppercase tracking-wider text-ink-muted">
                Comments
              </h2>

              <Card className="mb-4">
                <div className="flex gap-2">
                  <input
                    className="field flex-1"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Say something useful…"
                    maxLength={5000}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void postComment();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={postComment}
                    disabled={sending || !comment.trim()}
                    className="btn-primary !px-4"
                    aria-label="Post comment"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </Card>

              <AsyncSection state={comments}>
                {(list) =>
                  list.comments.length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-ink-muted">
                      No comments yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {list.comments.map((item) => (
                        <Card key={item._id} className="!p-4">
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold text-ink-secondary">
                                {item.authorName || 'A member'}
                                <span className="ml-2 font-normal text-ink-muted">
                                  {timeAgo(item.createdAt)}
                                </span>
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-secondary">
                                {item.content}
                              </p>
                            </div>

                            {/* Comments carry their author's uid, so a report on
                                one can name who wrote it — which is what makes
                                blocking them possible later. */}
                            {item.uid !== user?.uid && (
                              <button
                                type="button"
                                onClick={() =>
                                  setReporting({
                                    contentKind: 'comment',
                                    contentId: item._id,
                                    parentId: id,
                                    reportedUid: item.uid || null,
                                    excerpt: item.content,
                                  })
                                }
                                className="shrink-0 text-ink-muted transition hover:text-accent"
                                title="Report this comment"
                                aria-label="Report this comment"
                              >
                                <Flag className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )
                }
              </AsyncSection>
            </>
          );
        }}
      </AsyncSection>

      <ReportDialog target={reporting} onClose={() => setReporting(null)} />
    </>
  );
}
