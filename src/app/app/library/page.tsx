'use client';

import { BookOpen, Lock } from 'lucide-react';

import {
  AsyncSection,
  Card,
  EmptyState,
  PageHeader,
  useApi,
} from '@/components/app/ui';
import { api, type Paged } from '@/lib/api';

/**
 * The library.
 *
 * The PDF link is never in this response. It is marked `select: false` on the
 * schema, so Mongoose leaves it out of every query unless it is asked for by
 * name — and the only place that asks is the entitlement endpoint, which checks
 * for a matching purchase first.
 *
 * That is why "Read" is a second request rather than an href rendered into the
 * card: putting the link in the listing would hand every member the whole
 * library in a network tab.
 */

type Product = {
  _id: string;
  title: string;
  description?: string;
  price?: string;
  priceAmount?: number | null;
  coverImageUrl?: string;
  owned?: boolean;
};

export default function LibraryPage() {
  const state = useApi(
    () => api.get<Paged<Product, 'products'>>('/api/library/products', { limit: 30 }),
    []
  );

  async function open(product: Product) {
    try {
      const body = await api.get<{ pdfLink: string }>(
        `/api/library/products/${product._id}/link`
      );
      if (body?.pdfLink) window.open(body.pdfLink, '_blank', 'noopener');
      else alert('That book has no file attached yet.');
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Could not open that book.'
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Library"
        subtitle="A short shelf rather than a storefront. What you buy stays yours, even if the listing is later withdrawn."
      />

      <AsyncSection state={state}>
        {(data) =>
          data.products.length === 0 ? (
            <EmptyState
              title="The shelf is empty"
              body="Titles are added occasionally. There is no subscription — books are individually free or individually bought."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.products.map((product) => {
                const free = !product.priceAmount;
                const readable = free || product.owned;

                return (
                  <Card key={product._id} className="flex flex-col">
                    <div className="mb-3 flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-primary text-white">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-[14.5px] font-semibold leading-snug text-ink-primary">
                          {product.title}
                        </h2>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {free ? 'Free' : product.price || 'Paid'}
                          {product.owned ? ' · yours' : ''}
                        </p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="mb-4 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-ink-secondary">
                        {product.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => open(product)}
                      disabled={!readable}
                      className={readable ? 'btn-primary !py-2.5 text-[13px]' : 'btn-ghost !py-2.5 text-[13px]'}
                    >
                      {readable ? (
                        'Read'
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" /> Buy in the app
                        </>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          )
        }
      </AsyncSection>

      <p className="mt-8 text-center text-[11.5px] leading-relaxed text-ink-muted">
        Purchases are made in the Android app, where the payment signature is
        verified server-side before anything unlocks.
      </p>
    </>
  );
}
