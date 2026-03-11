import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FriendListScreen } from '../screens/friends/FriendListScreen';
import { ChatListScreen } from '../screens/chats/ChatListScreen';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Friends" component={FriendListScreen} options={{ title: '친구' }} />
      <Tab.Screen name="Chats" component={ChatListScreen} options={{ title: '채팅' }} />
    </Tab.Navigator>
  );
}
