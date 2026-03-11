import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { RegisterPage } from './RegisterPage';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const login = useAuthStore((s) => s.login);

  if (showRegister) return <RegisterPage onBack={() => setShowRegister(false)} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, width: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>로그인</h2>
        {error && <p style={{ color: 'red', marginBottom: 12, fontSize: 14 }}>{error}</p>}
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
