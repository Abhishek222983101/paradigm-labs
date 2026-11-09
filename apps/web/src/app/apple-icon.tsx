import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0a0a0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="132" height="132" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <g stroke="#f2f2f3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 12.5V10a2 2 0 0 1 2-2h2.5" />
          <path d="M19.5 8H22a2 2 0 0 1 2 2v2.5" />
          <path d="M24 19.5V22a2 2 0 0 1-2 2h-2.5" />
          <path d="M12.5 24H10a2 2 0 0 1-2-2v-2.5" />
        </g>
        <circle cx="16" cy="16" r="3.6" fill="#FE7446" />
      </svg>
    </div>,
    size,
  )
}
