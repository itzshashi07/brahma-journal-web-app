import { ImageResponse } from "next/og";
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 75,
          background: "#f7f6f2",
          color: "#242035",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#6c4ab0" }}>
          InnenFlow · A quieter place to think
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 78,
            letterSpacing: -3,
            lineHeight: 1.08,
          }}
        >
          <span>A little less in your head.</span>
          <span style={{ color: "#6c4ab0" }}>A little more you.</span>
        </div>
        <div style={{ display: "flex", fontSize: 25 }}>
          Private journal. Daily pause. Available on Google Play.
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
