import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#171716", color: "#f2f2ef", fontSize: 78, letterSpacing: 1, fontWeight: 700 }}>
        RA
      </div>
    ),
    size,
  );
}
