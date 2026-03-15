import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeStack from './HomeStack';
import CardsStack from './CardsStack';
import RecommendStack from './RecommendStack';
import SpendingStack from './SpendingStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home-outline',
            Cards: 'credit-card-outline',
            Recommend: 'star-outline',
            Spending: 'receipt',
            Profile: 'account-outline',
          };
          return <MaterialCommunityIcons name={icons[route.name] ?? 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Cards" component={CardsStack} />
      <Tab.Screen name="Recommend" component={RecommendStack} />
      <Tab.Screen name="Spending" component={SpendingStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
