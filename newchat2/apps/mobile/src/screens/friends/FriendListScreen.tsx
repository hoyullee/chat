import React, { useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFriendStore } from '../../store/friendStore';

export function FriendListScreen({ navigation }: any) {
  const { friends, loadFriends } = useFriendStore();

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>친구 {friends.length}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddFriend')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>친구를 추가해보세요!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.displayName?.[0] ?? '?'}</Text>
            </View>
            <View>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { fontSize: 22, color: '#555', lineHeight: 28 },
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
  name: { fontSize: 15, fontWeight: '600', color: '#111' },
  email: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 14 },
});
