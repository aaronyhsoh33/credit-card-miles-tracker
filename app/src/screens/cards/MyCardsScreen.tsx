import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StackNavigationProp } from '@react-navigation/stack';
import { getMyCards, removeMyCard } from '../../api/cards.api';
import { CardsStackParamList } from '../../navigation/CardsStack';
import { formatMpd } from '../../utils/miles.utils';

type Props = { navigation: StackNavigationProp<CardsStackParamList, 'MyCards'> };

export default function MyCardsScreen({ navigation }: Props) {
  const queryClient = useQueryClient();

  const { data: userCards = [], isLoading } = useQuery({
    queryKey: ['myCards'],
    queryFn: getMyCards,
  });

  const removeMutation = useMutation({
    mutationFn: removeMyCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCards'] }),
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      {userCards.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>No cards in your wallet yet.</Text>
          <Button mode="contained" onPress={() => navigation.navigate('AddCard')} style={styles.addBtn}>
            Add Your First Card
          </Button>
        </View>
      ) : (
        <FlatList
          data={userCards}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('CardDetail', { cardId: item.cardId })}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text variant="titleMedium">{item.nickname ?? item.card.name}</Text>
                      {item.nickname && (
                        <Text variant="bodySmall" style={styles.cardSubtitle}>{item.card.name}</Text>
                      )}
                      <Text variant="bodySmall" style={styles.bank}>{item.card.bank} · {item.card.network}</Text>
                    </View>
                    <Button
                      compact
                      textColor="red"
                      onPress={() => removeMutation.mutate(item.cardId)}
                    >
                      Remove
                    </Button>
                  </View>
                  <View style={styles.rateChips}>
                    {item.card.rateRules.slice(0, 3).map((rule) => (
                      <View key={rule.id} style={styles.rateChip}>
                        <Text variant="labelSmall">{rule.category.label}</Text>
                        <Text variant="labelSmall" style={styles.mpd}>{formatMpd(parseFloat(rule.mpd))}</Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('AddCard')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardSubtitle: { opacity: 0.5 },
  bank: { opacity: 0.5, marginTop: 2 },
  rateChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  rateChip: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mpd: { color: '#1a7f3c', fontWeight: '700' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { marginBottom: 24, textAlign: 'center', opacity: 0.6 },
  addBtn: { width: '100%' },
});
