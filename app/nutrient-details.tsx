import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NUTRIENTS } from '@/lib/nutrients';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { CircularProgress } from '@/components/CircularProgress';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

export default function NutrientDetailsScreen() {
  const router = useRouter();
  const { nutrientName } = useLocalSearchParams<{ nutrientName: string }>();
  const nutrient = NUTRIENTS[nutrientName];
  const [currentAmount, setCurrentAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysAmount();
  }, []);

  const fetchTodaysAmount = async () => {
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

      const total = (meals || []).reduce((acc, meal) => {
        return acc + (meal.nutrient_content[nutrientName] || 0);
      }, 0);

      setCurrentAmount(total);
    } catch (error) {
      console.error('Error fetching nutrient amount:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!nutrient) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Nutrient not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Nutrient Details</ThemedText>
        <View style={styles.backButton} />
      </View>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title} numberOfLines={1} ellipsizeMode="tail">{nutrientName}</ThemedText>
        
        <View style={styles.progressContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#0368F0" />
          ) : (
            <>
              <CircularProgress
                progress={Math.min((currentAmount / nutrient.target) * 100, 100)}
                size={120}
                strokeWidth={12}
                color="#0368F0"
              />
              <View style={styles.progressText}>
                <ThemedText style={styles.currentAmount}>{currentAmount.toFixed(1)}</ThemedText>
                <ThemedText style={styles.targetAmount}>/ {nutrient.target} {nutrient.unit}</ThemedText>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Daily Target</ThemedText>
          <ThemedText style={styles.text}>
            {nutrient.target} {nutrient.unit}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Purpose</ThemedText>
          <ThemedText style={styles.text}>{nutrient.purpose}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Food Sources</ThemedText>
          <ThemedText style={styles.text}>{nutrient.sources}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recommendations</ThemedText>
          <ThemedText style={styles.text}>{nutrient.recommendations}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
    paddingHorizontal: 12,
    paddingBottom: 5,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    padding: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    flex: 1,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    flex: 1,
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0368F0',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    gap: 16,
  },
  progressText: {
    marginLeft: 16,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: '600',
  },
  targetAmount: {
    fontSize: 16,
    color: '#666',
  },
}); 