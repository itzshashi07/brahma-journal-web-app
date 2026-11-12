"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { moments } from "@/content/moments";
import { DownloadButton } from "./DownloadButton";

export function VibePicker() {
  const [selected, setSelected] = useState(0);
  const moment = moments[selected];
  return (
    <section className="vibe-section section-space" id="your-vibe">
      <div className="promo-container">
        <div className="section-heading-row">
          <div className="section-intro">
            <span className="eyebrow">REAL LIFE DOESN’T HAVE ONE SETTING</span>
            <h2>Aaj ka scene kya hai?</h2>
            <p>Pick a familiar moment. Find a small place to start.</p>
          </div>
          <Link href="/moments" className="text-link">
            Explore the moments <ArrowRight size={17} />
          </Link>
        </div>
        <div
          className="vibe-options"
          role="group"
          aria-label="Choose a familiar moment"
        >
          {moments.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              aria-pressed={selected === index}
              aria-controls="vibe-suggestion"
              onClick={() => setSelected(index)}
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div
          className="vibe-answer"
          id="vibe-suggestion"
          aria-live="polite"
          aria-atomic="true"
        >
          <div>
            <span className="vibe-caption">SOUND FAMILIAR?</span>
            <h3>{moment.headline}</h3>
            <p>{moment.suggestion}</p>
            <Link className="text-link" href={`/moments/${moment.slug}`}>
              Find your small next step <ArrowRight size={17} />
            </Link>
          </div>
          <div className="vibe-prompt">
            <span>A JOURNAL STARTER TO TAKE WITH YOU</span>
            <p>“{moment.prompt}”</p>
            <DownloadButton compact label="Try InnenFlow on Android" />
          </div>
        </div>
      </div>
    </section>
  );
}
