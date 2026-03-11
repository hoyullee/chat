import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFriendStore } from '../../store/friendStore';

export function FriendListScreen({ navigation }: any) {
  const { friends, loadFriends } = useFriendStore();

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>친구 {friends.length}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddFriend')}>
          <Text style={styles.addBtn}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.displayName?.[0] ?? '?'}</Text>
            </View>
            <Text style={styles.name}>{item.displayName}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  addBtn: { fontSize: 24, color: '#888' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEE500', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 16 },
});
