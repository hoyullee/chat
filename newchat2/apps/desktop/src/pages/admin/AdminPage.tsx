import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

export function AdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<UserItem | null>(null);
  const { toast, show: showToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/admin/all');
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleActive = async (user: UserItem) => {
    try {
      await api.patch(`/users/admin/${user.id}/active`, { isActive: !user.isActive });
      loadUsers();
    } catch {
      showToast('상태 변경에 실패했습니다.', 'error');
    }
  };

  const deleteUser = (user: UserItem) => {
    if (user.role === 'admin') {
      showToast('관리자 계정은 삭제할 수 없습니다.', 'error');
      return;
    }
    setConfirmTarget(user);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      await api.delete(`/users/admin/${confirmTarget.id}`);
      setConfirmTarget(null);
      loadUsers();
    } catch {
      showToast('삭제에 실패했습니다.', 'error');
      setConfirmTarget(null);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>로딩 중...</div>;

  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto', position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? '#e6f9ee' : '#fff0f0',
          color: toast.type === 'success' ? '#1a7a3c' : '#c0392b',
          borderRadius: 8, padding: '10px 20px', zIndex: 1000, fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {confirmTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <p style={{ marginBottom: 20, fontSize: 15 }}>
              <strong>{confirmTarget.displayName}</strong> 회원을 삭제할까요?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmTarget(null)}
                style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={confirmDelete}
                style={{ padding: '8px 16px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 16 }}>회원 관리 ({users.length}명)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={th}>닉네임</th>
            <th style={th}>이메일</th>
            <th style={th}>역할</th>
            <th style={th}>상태</th>
            <th style={th}>가입일</th>
            <th style={th}>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={td}>{u.displayName}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <span style={{ color: u.role === 'admin' ? '#ff6b00' : '#333', fontWeight: u.role === 'admin' ? 'bold' : 'normal' }}>
                  {u.role === 'admin' ? '관리자' : '일반'}
                </span>
              </td>
              <td style={td}>
                <span style={{ color: u.isActive ? '#4CAF50' : '#f44336' }}>
                  {u.isActive ? '활성' : '비활성'}
                </span>
              </td>
              <td style={td}>{new Date(u.createdAt).toLocaleDateString('ko-KR')}</td>
              <td style={td}>
                {u.role !== 'admin' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => toggleActive(u)}
                      style={{ padding: '4px 8px', background: u.isActive ? '#FF9800' : '#4CAF50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      {u.isActive ? '비활성화' : '활성화'}
                    </button>
                    <button onClick={() => deleteUser(u)}
                      style={{ padding: '4px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      삭제
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px 12px' };
