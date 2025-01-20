import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { NutrientCard } from '@/components/NutrientCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

interface Meal {
  nutrient_content: {
    'Omega-3': number;
    'Phosphatidylserine': number;
    'Choline': number;
    'Creatine': number;
    'Vitamin D3': number;
  };
}

const TARGET_NUTRIENTS = {
  'Omega-3': { target: 2, unit: 'g' },
  'Phosphatidylserine': { target: 300, unit: 'mg' },
  'Choline': { target: 500, unit: 'mg' },
  'Creatine': { target: 5, unit: 'g' },
  'Vitamin D3': { target: 4000, unit: 'IU' }
};

const NUTRIENT_PURPOSES: Record<keyof typeof TARGET_NUTRIENTS, string> = {
  'Omega-3': 'Brain function & mood regulation',
  'Phosphatidylserine': 'Cognitive function & memory',
  'Choline': 'Focus & memory support',
  'Creatine': 'Brain function & muscle strength',
  'Vitamin D3': 'Hormonal & bone health'
};

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>({
    'Omega-3': 0,
    'Phosphatidylserine': 0,
    'Choline': 0,
    'Creatine': 0,
    'Vitamin D3': 0
  });

  useEffect(() => {
    fetchTodaysMeals();
  }, []);

  const fetchTodaysMeals = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const { data: meals, error } = await supabase
        .from('meals')
        .select('nutrient_content')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay(today).toISOString())
        .lte('created_at', endOfDay(today).toISOString());

      if (error) throw error;

      // Calculate totals from all meals
      const totals = (meals || []).reduce((acc, meal: Meal) => {
        Object.entries(meal.nutrient_content).forEach(([nutrient, value]) => {
          acc[nutrient] = (acc[nutrient] || 0) + value;
        });
        return acc;
      }, {} as Record<string, number>);

      setDailyTotals(totals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={styles.profileButton}
          >
            <IconSymbol size={32} name="person.circle.fill" color="#000" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0368F0" />
            <ThemedText style={styles.loadingText}>Loading nutrients...</ThemedText>
          </View>
        ) : (
          Object.entries(TARGET_NUTRIENTS).map(([nutrient, { target, unit }]: [keyof typeof TARGET_NUTRIENTS, { target: number, unit: string }]) => (
            <NutrientCard
              key={nutrient}
              name={nutrient}
              purpose={NUTRIENT_PURPOSES[nutrient]}
              current={dailyTotals[nutrient] || 0}
              target={target}
              unit={unit}
            />
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: {
    marginTop: -5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
