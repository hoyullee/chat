import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
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

export function AdminScreen() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<UserItem | null>(null);
  const { toast, show: showToast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/admin/all');
      setUsers(data);
    } catch {
      showToast('유저 목록을 불러오지 못했습니다.', 'error');
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {toast && (
        <View style={[styles.toast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={[styles.toastText, toast.type === 'error' ? styles.toastTextError : styles.toastTextSuccess]}>
            {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
          </Text>
        </View>
      )}

      <Modal visible={!!confirmTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              <Text style={{ fontWeight: 'bold' }}>{confirmTarget?.displayName}</Text> 회원을 삭제할까요?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmTarget(null)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDelete}>
                <Text style={styles.deleteConfirmBtnText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  toast: {
    position: 'absolute', top: 0, left: 0, right: 0,
    borderRadius: 0, padding: 12, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 6,
  },
  toastSuccess: { backgroundColor: '#e6f9ee' },
  toastError: { backgroundColor: '#fff0f0' },
  toastText: { fontSize: 14 },
  toastTextSuccess: { color: '#1a7a3c' },
  toastTextError: { color: '#c0392b' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 280, elevation: 8 },
  modalText: { fontSize: 15, marginBottom: 20, lineHeight: 22 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6 },
  cancelBtnText: { fontSize: 14, color: '#333' },
  deleteConfirmBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f44336', borderRadius: 6 },
  deleteConfirmBtnText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
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
