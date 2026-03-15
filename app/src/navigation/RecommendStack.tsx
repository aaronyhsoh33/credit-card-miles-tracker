import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecommendScreen from '../screens/recommend/RecommendScreen';

export type RecommendStackParamList = {
  RecommendMain: { categorySlug?: string; amount?: number } | undefined;
};

const Stack = createStackNavigator<RecommendStackParamList>();

export default function RecommendStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecommendMain" component={RecommendScreen} options={{ title: 'Best Card' }} />
    </Stack.Navigator>
  );
}
