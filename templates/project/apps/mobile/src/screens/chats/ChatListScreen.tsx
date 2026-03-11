import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useChatStore } from '../../store/chatStore';

export function ChatListScreen({ navigation }: any) {
  const { rooms, loadRooms } = useChatStore();

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('ChatRoom', { roomId: item.id })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.[0] ?? '#'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name || '채팅방'}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage || ''}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', padding: 16 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500' },
  lastMsg: { fontSize: 14, color: '#888', marginTop: 2 },
});
