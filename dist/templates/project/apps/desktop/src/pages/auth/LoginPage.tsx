import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, width: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>로그인</h2>
        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
        <input
          type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <input
          type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 20, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
        <button type="submit"
          style={{ width: '100%', padding: 12, background: '#FEE500', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 15 }}>
          로그인
        </button>
      </form>
    </div>
  );
}
