"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function SharePause() {
  const [status, setStatus] = useState("");
  async function share() {
    const url = new URL("/", window.location.origin).href;
    const data = {
      title: "InnenFlow — 37 tabs open?",
      text: "For the brain with too many tabs open. A private journal and a little pause, on Android.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setStatus("Thanks for passing a little pause along.");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus("Link copied. Send it to someone who needs a little pause.");
      } else {
        setStatus(`Copy this link to share: ${url}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus(`You can share this link: ${url}`);
    }
  }
  return (
    <div className="share-pause">
      <p>Know a brain with 37 tabs open?</p>
      <button type="button" onClick={share}>
        <Share2 size={17} /> Share a little pause
      </button>
      <span role="status">{status}</span>
    </div>
  );
}
