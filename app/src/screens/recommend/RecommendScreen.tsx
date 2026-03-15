import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Text, TextInput, Card, Chip, ActivityIndicator, Banner } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { listCategories } from '../../api/categories.api';
import { recommend } from '../../api/recommend.api';
import { formatMiles, formatMpd } from '../../utils/miles.utils';
import { formatSGD } from '../../utils/currency.utils';
import { RecommendStackParamList } from '../../navigation/RecommendStack';

export default function RecommendScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RecommendStackParamList, 'RecommendMain'>>();

  const [selectedCategory, setSelectedCategory] = useState<string>(route.params?.categorySlug ?? '');
  const [amountText, setAmountText] = useState(
    route.params?.amount ? String(route.params.amount) : ''
  );

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  });

  const amount = amountText ? parseFloat(amountText) : undefined;

  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['recommend', selectedCategory, amount],
    queryFn: () => recommend(selectedCategory, amount),
    enabled: !!selectedCategory,
  });

  return (
    <View style={styles.container}>
      {/* Category Grid */}
      <View style={styles.categorySection}>
        <Text variant="labelLarge" style={styles.label}>Spending Category</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => c.slug}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategory === item.slug}
              onPress={() => setSelectedCategory(item.slug)}
              style={styles.categoryChip}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      {/* Amount Input */}
      <View style={styles.amountSection}>
        <TextInput
          label="Amount (optional)"
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          left={<TextInput.Affix text="S$" />}
          style={styles.amountInput}
          dense
        />
      </View>

      {/* Results */}
      {!selectedCategory ? (
        <View style={styles.placeholder}>
          <Text variant="bodyMedium" style={styles.placeholderText}>
            Select a category to see which card earns the most miles
          </Text>
        </View>
      ) : isLoading || isFetching ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : results.length === 0 ? (
        <View style={styles.placeholder}>
          <Text variant="bodyMedium" style={styles.placeholderText}>
            No cards in your wallet yet. Add cards from the Cards tab.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.results} contentContainerStyle={styles.resultsList}>
          {results.map((result, index) => (
            <Card key={result.cardId} style={[styles.resultCard, index === 0 && styles.topCard]}>
              <Card.Content>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    {index === 0 && (
                      <Text variant="labelSmall" style={styles.bestBadge}>BEST CHOICE</Text>
                    )}
                    <Text variant="titleMedium">{result.nickname ?? result.cardName}</Text>
                    <Text variant="bodySmall" style={styles.bankText}>
                      {result.bank} · Best rate: {formatMpd(result.bestMpd)}
                    </Text>
                  </View>
                  <View style={styles.resultMiles}>
                    {result.milesEarned !== null ? (
                      <>
                        <Text variant="titleLarge" style={styles.milesNum}>
                          {formatMiles(result.milesEarned)}
                        </Text>
                        <Text variant="bodySmall" style={styles.milesLabel}>miles</Text>
                      </>
                    ) : (
                      <Text variant="titleMedium" style={styles.rateNum}>
                        {formatMpd(result.effectiveRate)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Warnings */}
                {result.capsExhausted && (
                  <Text variant="bodySmall" style={styles.warning}>
                    Monthly cap reached — earning base rate only
                  </Text>
                )}
                {result.cappedWarning && !result.capsExhausted && (
                  <Text variant="bodySmall" style={styles.warning}>
                    Some spend capped — partial miles at base rate
                  </Text>
                )}
                {result.minSpendUnmet && (
                  <Text variant="bodySmall" style={styles.warning}>
                    Min. spend not met — best rate not active yet
                  </Text>
                )}

                {/* Log this spend shortcut */}
                {index === 0 && (
                  <TouchableOpacity
                    style={styles.logButton}
                    onPress={() =>
                      navigation.navigate('Spending', {
                        screen: 'AddTransaction',
                        params: {
                          categorySlug: selectedCategory,
                          cardId: result.cardId,
                        },
                      })
                    }
                  >
                    <Text variant="labelMedium" style={styles.logButtonText}>
                      Log spend with this card →
                    </Text>
                  </TouchableOpacity>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categorySection: { padding: 16, paddingBottom: 8 },
  label: { marginBottom: 8, opacity: 0.6 },
  categoryList: { gap: 8 },
  categoryChip: { marginRight: 4 },
  amountSection: { paddingHorizontal: 16, paddingBottom: 12 },
  amountInput: { backgroundColor: 'transparent' },
  results: { flex: 1 },
  resultsList: { padding: 16, gap: 12 },
  resultCard: { borderRadius: 12 },
  topCard: { borderWidth: 2, borderColor: '#1a7f3c' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultInfo: { flex: 1 },
  bestBadge: { color: '#1a7f3c', fontWeight: '700', marginBottom: 4 },
  bankText: { opacity: 0.5, marginTop: 2 },
  resultMiles: { alignItems: 'flex-end', minWidth: 64 },
  milesNum: { fontWeight: '700', color: '#1a7f3c' },
  milesLabel: { opacity: 0.5 },
  rateNum: { fontWeight: '700', color: '#1a7f3c' },
  warning: { color: '#e65100', marginTop: 8 },
  logButton: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  logButtonText: { color: '#1a7f3c' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  placeholderText: { opacity: 0.5, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
