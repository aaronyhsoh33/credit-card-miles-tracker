import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SpendingScreen from '../screens/spending/SpendingScreen';
import AddTransactionScreen from '../screens/spending/AddTransactionScreen';
import EditTransactionScreen from '../screens/spending/EditTransactionScreen';
import TransactionDetailScreen from '../screens/spending/TransactionDetailScreen';

export type SpendingStackParamList = {
  SpendingMain: undefined;
  AddTransaction: { categorySlug?: string; cardId?: number } | undefined;
  EditTransaction: { id: number };
  TransactionDetail: { id: number };
};

const Stack = createStackNavigator<SpendingStackParamList>();

export default function SpendingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SpendingMain" component={SpendingScreen} options={{ title: 'Spending' }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Log Spend' }} />
      <Stack.Screen name="EditTransaction" component={EditTransactionScreen} options={{ title: 'Edit Transaction' }} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction' }} />
    </Stack.Navigator>
  );
}
