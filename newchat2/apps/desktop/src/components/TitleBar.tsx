import React from 'react';

declare global {
  interface Window {
    windowControls?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

interface Props {
  title?: string;
  bg?: string;
}

export function TitleBar({ title = '카카오채팅', bg = '#ffffff' }: Props) {
  // 배경이 어두운지 판단해 아이콘 색상 결정 (현재 사용되는 색은 모두 밝은 계열)
  const iconColor = '#3A3A3A';

  return (
    <div
      className="titlebar"
      style={{
        height: 38,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 14,
        flexShrink: 0,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        borderBottom: 'none',
      } as React.CSSProperties}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: iconColor, letterSpacing: '-0.2px' }}>
        {title}
      </span>

      <div style={{ display: 'flex', WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button className="titlebar-btn" onClick={() => window.windowControls?.minimize()} title="최소화">
          <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
            <rect width="10" height="2" rx="1" fill={iconColor} />
          </svg>
        </button>
        <button className="titlebar-btn" onClick={() => window.windowControls?.maximize()} title="최대화">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="0.5" y="0.5" width="9" height="9" rx="1.5" stroke={iconColor} strokeWidth="1.5" />
          </svg>
        </button>
        <button className="titlebar-btn titlebar-close" onClick={() => window.windowControls?.close()} title="닫기">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="1" y1="1" x2="9" y2="9" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
