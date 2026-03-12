import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FriendListScreen } from '../screens/friends/FriendListScreen';
import { AddFriendScreen } from '../screens/friends/AddFriendScreen';

const Stack = createNativeStackNavigator();

export function FriendsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendList" component={FriendListScreen} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
    </Stack.Navigator>
  );
}
