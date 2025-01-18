import { StyleSheet, ScrollView, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { NutrientCard } from '@/components/NutrientCard';

const NUTRIENTS = [
  {
    name: 'Omega-3',
    purpose: 'Brain function & mood regulation',
    current: 1.2,
    target: 2,
    unit: 'g'
  },
  {
    name: 'Phosphatidylserine',
    purpose: 'Cognitive function & memory',
    current: 200,
    target: 300,
    unit: 'mg'
  },
  {
    name: 'Choline',
    purpose: 'Focus & memory support',
    current: 400,
    target: 500,
    unit: 'mg'
  },
  {
    name: 'Creatine',
    purpose: 'Brain function & muscle strength',
    current: 3,
    target: 5,
    unit: 'g'
  },
  {
    name: 'Vitamin D3',
    purpose: 'Hormonal & bone health',
    current: 2000,
    target: 4000,
    unit: 'IU'
  },
  // Add other nutrients as needed
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
        </View>
        {NUTRIENTS.map((nutrient, index) => (
          <NutrientCard
            key={index}
            name={nutrient.name}
            purpose={nutrient.purpose}
            current={nutrient.current}
            target={nutrient.target}
            unit={nutrient.unit}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 48,
  },
  header: {
    marginBottom: 16,
  },
});
