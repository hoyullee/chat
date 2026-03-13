import React, { useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';

export interface ProfileUser {
  id: string;
  displayName: string;
  email?: string;
  avatar?: string;
  backgroundImage?: string;
}

interface Props {
  profileUser: ProfileUser;
  isOwn: boolean;
  onClose: () => void;
}

type ImageTarget = 'avatar' | 'background' | null;

export function ProfileDetailPage({ profileUser, isOwn, onClose }: Props) {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const socket = useSocket();

  const [current, setCurrent] = useState<ProfileUser>(profileUser);
  const [imagePopup, setImagePopup] = useState<ImageTarget>(null);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (file: File, target: 'avatar' | 'backgroundImage') => {
    setSaving(true);
    setImagePopup(null);
    try {
      const base64 = await toBase64(file);
      const updated = await updateProfile({ [target]: base64 });
      const next = { ...current, avatar: updated.avatar, backgroundImage: updated.backgroundImage };
      setCurrent(next);
      socket.emit('broadcast-profile-update', {
        userId: updated.id,
        avatar: updated.avatar,
        backgroundImage: updated.backgroundImage,
        displayName: updated.displayName,
      });
    } finally {
      setSaving(false);
    }
  };

  const bgStyle: React.CSSProperties = current.backgroundImage
    ? { backgroundImage: `url(${current.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(160deg, #b2c7d9 0%, #8aafc7 100%)' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      onClick={() => { setImagePopup(null); onClose(); }}
    >
      {/* 배경 영역 */}
      <div
        style={{ flex: '0 0 55%', position: 'relative', cursor: isOwn ? 'pointer' : 'default', ...bgStyle }}
        onClick={(e) => {
          e.stopPropagation();
          if (isOwn) setImagePopup(imagePopup === 'background' ? null : 'background');
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            position: 'absolute', top: 46, left: 10, width: 34, height: 34, borderRadius: '50%',
            border: 'none', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* 배경 변경 팝업 */}
        {imagePopup === 'background' && (
          <div
            onClick={(e) => { e.stopPropagation(); bgInputRef.current?.click(); }}
            style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 16 }}>🖼</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>배경 변경</span>
          </div>
        )}
        <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f, 'backgroundImage'); e.target.value = ''; }} />
      </div>

      {/* 하단 흰색 영역 */}
      <div
        style={{ flex: 1, background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 52 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아바타 (배경/흰 영역 경계에 겹침) */}
        <div
          style={{
            position: 'absolute', top: -44, left: '50%', transform: 'translateX(-50%)',
            width: 88, height: 88, borderRadius: 44,
            background: current.avatar ? 'transparent' : '#FEE500',
            backgroundImage: current.avatar ? `url(${current.avatar})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: 36, border: '3px solid #fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            cursor: isOwn ? 'pointer' : 'default',
          }}
          onClick={(e) => { e.stopPropagation(); if (isOwn) setImagePopup(imagePopup === 'avatar' ? null : 'avatar'); }}
        >
          {!current.avatar && (current.displayName?.[0] ?? '?')}

          {/* 아바타 변경 팝업 */}
          {imagePopup === 'avatar' && (
            <div
              onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
              style={{
                position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: '7px 14px',
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 14 }}>📷</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>프로필 변경</span>
            </div>
          )}
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f, 'avatar'); e.target.value = ''; }} />

        {/* 닉네임 */}
        <div style={{ fontWeight: 'bold', fontSize: 18, color: '#111', marginTop: 8 }}>{current.displayName}</div>
        {current.email && <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{current.email}</div>}

        {saving && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#aaa' }}>저장 중...</div>
        )}
      </div>
    </div>
  );
}
