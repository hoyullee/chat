import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useFriendStore } from '../../store/friendStore';

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

export function AddFriendScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { friends, searchResults, searchUsers, addFriend, clearSearch } = useFriendStore();
  const friendIds = new Set(friends.map((f) => f.id));
  const { toast, show: showToast } = useToast();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 1) {
      clearSearch();
      return;
    }
    setLoading(true);
    try {
      await searchUsers(text);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string, displayName: string) => {
    try {
      await addFriend(userId);
      showToast(`${displayName}님을 친구로 추가했습니다.`, 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? '친구 추가에 실패했습니다.';
      showToast(msg, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {toast && (
        <View style={[styles.toast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={[styles.toastText, toast.type === 'error' ? styles.toastTextError : styles.toastTextSuccess]}>
            {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
          </Text>
        </View>
      )}
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.title}>친구 추가</Text>
        <TouchableOpacity onPress={() => { clearSearch(); navigation.goBack(); }} style={styles.headerSide}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 입력 */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임 또는 이메일 검색"
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); clearSearch(); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 결과 */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#FEE500" />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            query.length > 0 ? (
              <Text style={styles.empty}>검색 결과가 없습니다.</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const isAdded = friendIds.has(item.id);
            return (
              <View style={styles.item}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.displayName?.[0] ?? '?'}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, isAdded && styles.addBtnDone]}
                  onPress={() => !isAdded && handleAddFriend(item.id, item.displayName)}
                  disabled={isAdded}
                >
                  <Text style={[styles.addBtnText, isAdded && styles.addBtnTextDone]}>
                    {isAdded ? '추가됨' : '친구 추가'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerSide: { width: 44, alignItems: 'center' },
  closeIcon: { fontSize: 18, color: '#555', padding: 4 },
  title: { fontSize: 17, fontWeight: '600' },
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
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, paddingHorizontal: 12,
    backgroundColor: '#f5f5f5', borderRadius: 10, height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  clearIcon: { fontSize: 14, color: '#aaa', padding: 4 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#FEE500', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111' },
  email: { fontSize: 13, color: '#888', marginTop: 2 },
  addBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#FEE500', borderRadius: 20,
  },
  addBtnDone: { backgroundColor: '#e8e8e8' },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#111' },
  addBtnTextDone: { color: '#999' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
});
