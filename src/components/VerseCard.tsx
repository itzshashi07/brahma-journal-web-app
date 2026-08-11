import { GitaVerse, verseReference } from '@/content/gita';

/**
 * One verse, as somebody in trouble would want to meet it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * The order is the argument
 *
 * The application comes first, then the translation, and the Sanskrit is
 * folded away. That is the opposite of every printed edition, and it is
 * deliberate: a verse nobody understands consoles nobody. Somebody who opened
 * this at 2am because they did not get the job is not looking for Devanagari,
 * they are looking for the sentence that says *the outcome was never the part
 * you controlled*. The Sanskrit is there for the reader who wants it, one tap
 * away, and unfolded it is beautiful rather than a wall.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why `<details>` and not a toggle in React state
 *
 * Everything is in the DOM either way, which is the point. Conditionally
 * rendering the Hindi would mean Google indexes only the English half of a page
 * whose Hindi half is what most of its readers are actually searching in. A
 * `<details>` ships the whole thing, costs no JavaScript, works before hydration
 * and is keyboard-accessible without any help.
 */
export function VerseCard({ verse }: { verse: GitaVerse }) {
  return (
    <article className="glass p-5 sm:p-7">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <span className="chip">
          <span className="text-accent">॥</span>
          {verseReference(verse)}
        </span>
      </header>

      {/* What it means when you are living it. */}
      <p className="text-[15px] leading-[1.85] text-ink-primary">
        {verse.applicationEn}
      </p>

      <blockquote className="mt-5 border-l-2 border-primary/50 pl-4 text-[14.5px] italic leading-relaxed text-ink-secondary">
        {verse.translationEn}
      </blockquote>

      <div className="mt-5 space-y-2.5">
        <details className="group">
          <summary className="cursor-pointer list-none text-[13px] font-medium text-primary-light hover:text-accent-light">
            <span className="group-open:hidden">संस्कृत — show the original</span>
            <span className="hidden group-open:inline">Hide the Sanskrit</span>
          </summary>
          <div className="mt-3 rounded-md border border-hairline-soft bg-bg-dark/50 p-4">
            {/* `whitespace-pre-line`: the line breaks inside a shloka are part
                of the verse, not formatting. */}
            <p className="whitespace-pre-line text-[15px] leading-[2] text-ink-primary">
              {verse.sanskrit}
            </p>
            <p className="mt-3 whitespace-pre-line text-[13px] italic leading-relaxed text-ink-muted">
              {verse.transliteration}
            </p>
          </div>
        </details>

        <details className="group">
          <summary className="cursor-pointer list-none text-[13px] font-medium text-primary-light hover:text-accent-light">
            <span className="group-open:hidden">हिंदी में पढ़ें</span>
            <span className="hidden group-open:inline">हिंदी छिपाएँ</span>
          </summary>
          <div className="mt-3 space-y-3">
            <p className="text-[15px] leading-[1.9] text-ink-primary">
              {verse.applicationHi}
            </p>
            <blockquote className="border-l-2 border-accent/40 pl-4 text-[14px] leading-relaxed text-ink-secondary">
              {verse.translationHi}
            </blockquote>
          </div>
        </details>
      </div>
    </article>
  );
}
