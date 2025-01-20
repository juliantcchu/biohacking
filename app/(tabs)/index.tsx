import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { NutrientCard } from '@/components/NutrientCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { NUTRIENTS } from '@/lib/nutrients';

interface Meal {
  nutrient_content: {
    [K in keyof typeof NUTRIENTS]: number;
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState<Record<string, number>>(
    Object.keys(NUTRIENTS).reduce((acc, nutrient) => {
      acc[nutrient] = 0;
      return acc;
    }, {} as Record<string, number>)
  );

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
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <TouchableOpacity 
          onPress={() => router.push('/profile')}
          style={styles.profileButton}
        >
          <IconSymbol size={32} name="person.circle.fill" color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0368F0" />
            <ThemedText style={styles.loadingText}>Loading nutrients...</ThemedText>
          </View>
        ) : (
          Object.entries(NUTRIENTS).map(([nutrient, { target, unit, purpose }]) => (
            <NutrientCard
              key={nutrient}
              name={nutrient}
              purpose={purpose}
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
  },
  header: {
    padding: 16,
    paddingTop: 48,
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
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
