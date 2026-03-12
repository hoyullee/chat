import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FriendsStackNavigator } from './FriendsStackNavigator';
import { ChatListScreen } from '../screens/chats/ChatListScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, { default: string; focused: string }> = {
  Friends: { default: '👤', focused: '👥' },
  Chats:   { default: '💬', focused: '💬' },
  Admin:   { default: '⚙️', focused: '⚙️' },
};

export function MainNavigator() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icon = TAB_ICONS[route.name];
          return (
            <Text style={{ fontSize: 22 }}>
              {focused ? icon?.focused : icon?.default}
            </Text>
          );
        },
        tabBarActiveTintColor: '#3A1D1D',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FEE500',
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Friends" component={FriendsStackNavigator} options={{ title: '친구' }} />
      <Tab.Screen name="Chats"   component={ChatListScreen}        options={{ title: '채팅' }} />
      {isAdmin && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ title: '회원관리' }} />
      )}
    </Tab.Navigator>
  );
}
