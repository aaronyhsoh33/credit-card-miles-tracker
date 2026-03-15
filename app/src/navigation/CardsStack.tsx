import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyCardsScreen from '../screens/cards/MyCardsScreen';
import CardDetailScreen from '../screens/cards/CardDetailScreen';
import AddCardScreen from '../screens/cards/AddCardScreen';

export type CardsStackParamList = {
  MyCards: undefined;
  CardDetail: { cardId: number };
  AddCard: undefined;
};

const Stack = createStackNavigator<CardsStackParamList>();

export default function CardsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyCards" component={MyCardsScreen} options={{ title: 'My Cards' }} />
      <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Card Details' }} />
      <Stack.Screen name="AddCard" component={AddCardScreen} options={{ title: 'Add Card' }} />
    </Stack.Navigator>
  );
}
