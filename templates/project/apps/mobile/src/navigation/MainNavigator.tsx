import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FriendListScreen } from '../screens/friends/FriendListScreen';
import { ChatListScreen } from '../screens/chats/ChatListScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator>
      <Tab.Screen name="Friends" component={FriendListScreen} options={{ title: '친구' }} />
      <Tab.Screen name="Chats" component={ChatListScreen} options={{ title: '채팅' }} />
      {isAdmin && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ title: '회원관리' }} />
      )}
    </Tab.Navigator>
  );
}
