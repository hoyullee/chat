import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';

interface Props { onBack: (successMsg?: string) => void; }

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

export function RegisterPage({ onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, show: showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { showToast('비밀번호가 일치하지 않습니다.', 'error'); return; }
    if (password.length < 6) { showToast('비밀번호는 6자 이상이어야 합니다.', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/users/register', { email, password, displayName });
      onBack('회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (err: any) {
      showToast(err.response?.data?.message || '회원가입에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#e6f9ee' : '#fff0f0',
          color: toast.type === 'success' ? '#1a7a3c' : '#c0392b',
          borderRadius: 8, padding: '10px 20px', zIndex: 1000, fontSize: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, width: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>회원가입</h2>
        <input type="text" placeholder="닉네임" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} required />
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} required />
        <input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} required />
        <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 20, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} required />
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 12, background: '#FEE500', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 15, opacity: loading ? 0.6 : 1 }}>
          {loading ? '처리 중...' : '가입하기'}
        </button>
        <button type="button" onClick={() => onBack()}
          style={{ width: '100%', padding: 12, marginTop: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14 }}>
          이미 계정이 있으신가요? 로그인
        </button>
      </form>
    </div>
  );
}
