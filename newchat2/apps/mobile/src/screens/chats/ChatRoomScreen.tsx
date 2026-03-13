import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';

export function ChatRoomScreen({ route }: any) {
  const { roomId } = route.params;
  const { messages, loadMessages, addMessage } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();
  const [text, setText] = useState('');
  const [showEmoticons, setShowEmoticons] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages(roomId);
    socket.emit('join-room', { roomId });

    socket.on('receive-message', (msg: any) => {
      addMessage(roomId, { ...msg, isMine: msg.senderId === user?.id });
      flatListRef.current?.scrollToEnd();
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('receive-message');
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!text.trim() || !user?.id) return;
    const content = text;
    setText('');
    socket.emit('send-message', { roomId, content, type: 'text', senderId: user.id });
  };

  const sendEmoticon = (emoji: string) => {
    if (!user?.id) return;
    socket.emit('send-message', { roomId, content: emoji, type: 'emoticon', senderId: user.id });
    setShowEmoticons(false);
  };

  const roomMessages = messages[roomId] || [];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={roomMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.isMine ? styles.myBubble : styles.otherBubble]}>
            {item.type === 'emoticon' ? (
              <Text style={styles.emoticon}>{item.content}</Text>
            ) : (
              <Text style={item.isMine ? styles.myText : styles.otherText}>{item.content}</Text>
            )}
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      {showEmoticons && (
        <View style={styles.emoticonPicker}>
          {['😀', '😂', '❤️', '👍', '😍', '🎉', '😭', '😊', '🔥', '✨', '🥰', '😎'].map((emoji) => (
            <TouchableOpacity key={emoji} onPress={() => sendEmoticon(emoji)} style={styles.emoticonItem}>
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.inputRow}>
        <TouchableOpacity onPress={() => setShowEmoticons(!showEmoticons)} style={styles.emojiBtn}>
          <Text style={{ fontSize: 22 }}>😊</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="메시지 입력..."
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b2c7d9' },
  bubble: { maxWidth: '75%', margin: 6, padding: 10, borderRadius: 12 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#FEE500' },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  myText: { color: '#000' },
  otherText: { color: '#000' },
  emoticon: { fontSize: 36 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  emojiBtn: { padding: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100, marginHorizontal: 8 },
  sendBtn: { backgroundColor: '#FEE500', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendText: { fontWeight: 'bold' },
  emoticonPicker: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderTopColor: '#eee' },
  emoticonItem: { padding: 6 },
});
