import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../services/api';

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function AdminScreen() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/admin/all');
      setUsers(data);
    } catch {
      Alert.alert('오류', '유저 목록을 불러오지 못했습니다.');
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
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  const deleteUser = (user: UserItem) => {
    if (user.role === 'admin') {
      Alert.alert('불가', '관리자 계정은 삭제할 수 없습니다.');
      return;
    }
    Alert.alert('회원 삭제', `${user.displayName} 회원을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          await api.delete(`/users/admin/${user.id}`);
          loadUsers();
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원 관리 ({users.length}명)</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>
                {item.displayName}
                {item.role === 'admin' && <Text style={styles.adminBadge}> [관리자]</Text>}
              </Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={styles.actions}>
              {item.role !== 'admin' && (
                <>
                  <TouchableOpacity
                    style={[styles.btn, item.isActive ? styles.deactivate : styles.activate]}
                    onPress={() => toggleActive(item)}
                  >
                    <Text style={styles.btnText}>{item.isActive ? '비활성화' : '활성화'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => deleteUser(item)}>
                    <Text style={styles.btnText}>삭제</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  adminBadge: { color: '#ff6b00', fontSize: 12 },
  email: { fontSize: 13, color: '#888', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  activate: { backgroundColor: '#4CAF50' },
  deactivate: { backgroundColor: '#FF9800' },
  deleteBtn: { backgroundColor: '#f44336' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
