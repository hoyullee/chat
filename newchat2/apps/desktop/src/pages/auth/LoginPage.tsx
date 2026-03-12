import React, { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { RegisterPage } from './RegisterPage';

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { toast, show: showToast } = useToast();
  const login = useAuthStore((s) => s.login);

  if (showRegister) {
    return (
      <RegisterPage
        onBack={(successMsg) => {
          setShowRegister(false);
          if (successMsg) showToast(successMsg, 'success');
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      showToast(err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
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
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, width: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>로그인</h2>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 20, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }} required />
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: 12, background: '#FEE500', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 15, opacity: loading ? 0.6 : 1 }}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <button type="button" onClick={() => setShowRegister(true)}
          style={{ width: '100%', padding: 12, marginTop: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', fontSize: 14 }}>
          계정이 없으신가요? 회원가입
        </button>
      </form>
    </div>
  );
}
