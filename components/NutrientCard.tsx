import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { CircularProgress } from './CircularProgress';

interface NutrientCardProps {
  name: string;
  purpose: string;
  current: number;
  target: number;
  unit: string;
}

export function NutrientCard({ name, purpose, current, target, unit }: NutrientCardProps) {
  const progress = Math.min((current / target) * 100, 100);
  
  return (
    <View style={styles.card}>
      <View style={styles.chartContainer}>
        <CircularProgress 
          percentage={progress}
          radius={30}
          strokeWidth={8}
          color="#0368F0"
        />
      </View>
      <View style={styles.textContent}>
        <ThemedText type="subtitle" style={styles.name}>{name}</ThemedText>
        <ThemedText style={styles.purpose}>{purpose}</ThemedText>
        <ThemedText style={styles.intake}>
          {current}/{target} {unit}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  chartContainer: {
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    marginBottom: 4,
  },
  purpose: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  intake: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 