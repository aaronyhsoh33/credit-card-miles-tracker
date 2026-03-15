import React, { useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Text, Searchbar, Card, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { listCards, getMyCards, addMyCard } from '../../api/cards.api';
import { formatMpd } from '../../utils/miles.utils';

const BANKS = ['All', 'DBS', 'UOB', 'Citi', 'HSBC', 'SCB', 'OCBC'];

export default function AddCardScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('All');

  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: () => listCards(),
  });

  const { data: myCards = [] } = useQuery({
    queryKey: ['myCards'],
    queryFn: getMyCards,
  });

  const addMutation = useMutation({
    mutationFn: (cardId: number) => addMyCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCards'] });
    },
  });

  const myCardIds = new Set(myCards.map((uc) => uc.cardId));

  const filtered = allCards.filter((card) => {
    const matchesBank = selectedBank === 'All' || card.bank === selectedBank;
    const matchesSearch = !search || card.name.toLowerCase().includes(search.toLowerCase());
    return matchesBank && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search cards..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <FlatList
        horizontal
        data={BANKS}
        keyExtractor={(b) => b}
        renderItem={({ item }) => (
          <Chip
            selected={selectedBank === item}
            onPress={() => setSelectedBank(item)}
            style={styles.chip}
          >
            {item}
          </Chip>
        )}
        contentContainerStyle={styles.chips}
        showsHorizontalScrollIndicator={false}
      />

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isAdded = myCardIds.has(item.id);
            return (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text variant="titleMedium">{item.name}</Text>
                      <Text variant="bodySmall" style={styles.bank}>{item.bank} · {item.network}</Text>
                    </View>
                    <Button
                      mode={isAdded ? 'outlined' : 'contained'}
                      compact
                      disabled={isAdded || addMutation.isPending}
                      onPress={() => addMutation.mutate(item.id)}
                    >
                      {isAdded ? 'Added' : 'Add'}
                    </Button>
                  </View>
                  <View style={styles.rateChips}>
                    {item.rateRules.slice(0, 3).map((rule) => (
                      <View key={rule.id} style={styles.rateChip}>
                        <Text variant="labelSmall">{rule.category.label}: </Text>
                        <Text variant="labelSmall" style={styles.mpd}>{formatMpd(parseFloat(rule.mpd))}</Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16, marginBottom: 8 },
  chips: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: { marginRight: 4 },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, paddingRight: 8 },
  bank: { opacity: 0.5, marginTop: 2 },
  rateChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  rateChip: { flexDirection: 'row', backgroundColor: '#e8f5e9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mpd: { color: '#1a7f3c', fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
