"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

/** A decorative, locally hosted GIF. Motion is opt-in and has a static default. */
export function BrainTabs() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="tabs-animation">
      <picture>
        <source
          media="(prefers-reduced-motion: reduce)"
          srcSet="/images/brain-tabs-poster.svg"
        />
        {/* Native img keeps the GIF animated; Next image optimisation is unnecessary here. */}
        <img
          src={
            playing ? "/images/brain-tabs.gif" : "/images/brain-tabs-poster.svg"
          }
          alt="Illustration of a browser full of thoughts becoming a single tab: one thing at a time"
          width="560"
          height="370"
          loading="lazy"
        />
      </picture>
      <button
        type="button"
        onClick={() => setPlaying(!playing)}
        aria-pressed={playing}
        aria-label={playing ? "Pause tab animation" : "Play tab animation"}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {playing ? "Pause the tabs" : "Watch the tabs"}
      </button>
    </div>
  );
}
