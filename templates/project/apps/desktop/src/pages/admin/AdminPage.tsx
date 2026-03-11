import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function AdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    await api.patch(`/users/admin/${user.id}/active`, { isActive: !user.isActive });
    loadUsers();
  };

  const deleteUser = async (user: UserItem) => {
    if (user.role === 'admin') { alert('관리자 계정은 삭제할 수 없습니다.'); return; }
    if (!confirm(`${user.displayName} 회원을 삭제할까요?`)) return;
    await api.delete(`/users/admin/${user.id}`);
    loadUsers();
  };

  if (loading) return <div style={{ padding: 24 }}>로딩 중...</div>;

  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
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
