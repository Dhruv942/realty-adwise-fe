import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1b1b1c", color: "#fff", fontSize: 220, letterSpacing: 8, fontWeight: 300 }}>
        RA
      </div>
    ),
    size,
  );
}
