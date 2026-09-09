import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const cards = [
  { label: 'Fundamentals', note: 'Build strong foundations', x: 650, y: 135 },
  { label: 'Programming', note: 'Learn by doing', x: 720, y: 285 },
  { label: 'Backend', note: 'Design & build', x: 945, y: 185 },
  { label: 'DevOps', note: 'Ship with confidence', x: 900, y: 430 },
] as const;

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(125deg, #020b14 0%, #061525 52%, #03101c 100%)',
        color: '#f8fafc',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          opacity: 0.22,
          background:
            'linear-gradient(90deg, transparent 0%, transparent 48%, #0b4f88 100%)',
        }}
      />

      <div
        style={{
          width: '55%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '54px 0 52px 58px',
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: 42,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 34,
            border: '3px solid #2488ff',
            borderRadius: 7,
            color: '#55b9ff',
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          A
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 68,
            lineHeight: 0.96,
            letterSpacing: '-3px',
            fontWeight: 800,
          }}
        >
          <span>Software</span>
          <span>Development</span>
          <span style={{ color: '#2fb7ff' }}>Atlas</span>
        </div>
        <div
          style={{
            display: 'flex',
            width: 500,
            marginTop: 25,
            color: '#a7b7ca',
            fontSize: 26,
            lineHeight: 1.25,
          }}
        >
          A personal learning atlas for modern software engineering.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            color: '#73879d',
            fontSize: 17,
          }}
        >
          by Tran Trong Thuc · @thucne
        </div>
      </div>

      <svg
        width="590"
        height="590"
        viewBox="0 0 590 590"
        style={{ position: 'absolute', right: -10, top: 20, zIndex: 1 }}
      >
        <defs>
          <radialGradient id="globe" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#0d4f87" stopOpacity="0.72" />
            <stop offset="75%" stopColor="#062646" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#031325" stopOpacity="0.1" />
          </radialGradient>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2d8cff" />
            <stop offset="100%" stopColor="#5fe8ff" />
          </linearGradient>
        </defs>
        <circle cx="320" cy="285" r="220" fill="url(#globe)" stroke="#1260a7" strokeWidth="2" />
        <ellipse cx="320" cy="285" rx="220" ry="95" fill="none" stroke="#1670bb" strokeOpacity="0.45" />
        <ellipse cx="320" cy="285" rx="92" ry="220" fill="none" stroke="#1670bb" strokeOpacity="0.38" />
        <path d="M80 270 C180 85 340 90 500 235" fill="none" stroke="url(#line)" strokeWidth="2" />
        <path d="M85 360 C235 485 400 460 545 315" fill="none" stroke="url(#line)" strokeWidth="2" />
        <path d="M190 125 C315 220 335 340 465 430" fill="none" stroke="#4bd8ff" strokeWidth="2" strokeOpacity="0.9" />
        {[
          [80, 270],
          [190, 125],
          [292, 220],
          [385, 294],
          [465, 430],
          [545, 315],
          [175, 405],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill="#dff7ff" stroke="#46c9ff" strokeWidth="3" />
        ))}
      </svg>

      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            position: 'absolute',
            left: card.x,
            top: card.y,
            width: 225,
            height: 70,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 18px',
            border: '1px solid #24547a',
            borderRadius: 15,
            background: '#071d32e8',
            boxShadow: '0 10px 28px #00000055',
            zIndex: 4,
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 700 }}>{card.label}</span>
          <span style={{ marginTop: 5, color: '#9aadc0', fontSize: 13 }}>{card.note}</span>
        </div>
      ))}
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
