import React, { useEffect } from 'react';
import { useFriendStore } from '../../store/friendStore';

export function FriendsPage() {
  const { friends, loadFriends } = useFriendStore();

  useEffect(() => { loadFriends(); }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>친구 {friends.length}</h3>
      {friends.map((f) => (
        <div key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: '#FEE500', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, fontWeight: 'bold' }}>
            {f.displayName?.[0] ?? '?'}
          </div>
          <span>{f.displayName}</span>
        </div>
      ))}
    </div>
  );
}
