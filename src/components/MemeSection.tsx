import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrainTabs } from "./BrainTabs";
import { SharePause } from "./SharePause";

export function MemeSection() {
  return (
    <section className="meme-section section-space" id="relatable">
      <div className="promo-container">
        <div className="meme-heading">
          <span className="eyebrow">A LITTLE TOO RELATABLE</span>
          <h2>
            Big feelings.
            <br />
            <em>Very unserious brain.</em>
          </h2>
          <p>Laugh at the moment. Then make a little room for yourself.</p>
        </div>
        <div className="meme-grid">
          <article className="meme-card night-meme">
            <div className="meme-caption">
              <span>ME: JUST FIVE MORE MINUTES.</span>
              <h3>
                Also me:
                <br />
                is that the sunrise?
              </h3>
            </div>
            <Image
              src="/images/late-night-brain.webp"
              alt="Original clay-style illustration of a sleepy purple brain still looking at a phone at night"
              width={1254}
              height={1254}
              sizes="(max-width: 640px) 90vw, 40vw"
            />
            <Link href="/moments/late-night-thoughts">
              Give the thoughts a page <ArrowUpRight size={18} />
            </Link>
          </article>
          <article className="meme-card tabs-meme">
            <div className="meme-caption">
              <span>MY BRAIN, AT ANY GIVEN MOMENT</span>
              <h3>
                37 tabs open.
                <br />
                Where’s the music?
              </h3>
            </div>
            <BrainTabs />
            <Link href="/features/focus">
              One task is a good start <ArrowUpRight size={18} />
            </Link>
          </article>
          <article className="meme-card win-meme">
            <span className="meme-tag">TODAY’S PLOT TWIST</span>
            <p className="meme-expectation">
              The plan:
              <br />
              <s>fix my entire life</s>
            </p>
            <h3>
              The win:
              <br />I started<span aria-hidden="true">✳</span>
            </h3>
            <p className="meme-small">Small counts. Haan, that small.</p>
            <Link href="/features/small-wins">
              Keep a small win <ArrowUpRight size={18} />
            </Link>
          </article>
        </div>
        <SharePause />
        <p className="art-credit">
          Original humour & AI-created character illustrations for InnenFlow.
          The character is website artwork.
        </p>
      </div>
    </section>
  );
}
