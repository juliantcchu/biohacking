import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = 80;

interface Meal {
  id: string;
  created_at: string;
  image_id: string;
  user_id: string;
  nutrient_content: {
    'Omega-3': number;
    'Phosphatidylserine': number;
    'Choline': number;
    'Creatine': number;
    'Vitamin D3': number;
  };
  confirmed: boolean;
  notes: string;
}

interface GroupedMeals {
  [key: string]: Meal[];
}

type NutrientKey = 'Omega-3' | 'Phosphatidylserine' | 'Choline' | 'Creatine' | 'Vitamin D3';

interface DailyNutrients {
  [key: string]: Record<NutrientKey, number>;
}

const TARGET_NUTRIENTS: Record<NutrientKey, { target: number; unit: string }> = {
  'Omega-3': { target: 2, unit: 'g' },
  'Phosphatidylserine': { target: 300, unit: 'mg' },
  'Choline': { target: 500, unit: 'mg' },
  'Creatine': { target: 5, unit: 'g' },
  'Vitamin D3': { target: 4000, unit: 'IU' }
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedDate, setSelectedDate] = useState(0);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [meals, setMeals] = useState<GroupedMeals>({});
  const [dailyNutrients, setDailyNutrients] = useState<DailyNutrients>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mealsData, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group meals by date
      const grouped = (mealsData || []).reduce<GroupedMeals>((acc, meal) => {
        const date = format(parseISO(meal.created_at), 'yyyy-MM-dd');
        const displayDate = isToday(date) ? 'Today' : 
                          isYesterday(date) ? 'Yesterday' : 
                          format(parseISO(date), 'MMM d');
        
        if (!acc[displayDate]) {
          acc[displayDate] = [];
        }
        acc[displayDate].push(meal);
        return acc;
      }, {});

      // Calculate daily nutrient totals
      const dailyTotals = (mealsData || []).reduce<DailyNutrients>((acc, meal) => {
        const date = format(parseISO(meal.created_at), 'yyyy-MM-dd');
        const displayDate = isToday(date) ? 'Today' : 
                          isYesterday(date) ? 'Yesterday' : 
                          format(parseISO(date), 'MMM d');

        if (!acc[displayDate]) {
          acc[displayDate] = {
            'Omega-3': 0,
            'Phosphatidylserine': 0,
            'Choline': 0,
            'Creatine': 0,
            'Vitamin D3': 0
          };
        }

        Object.entries(meal.nutrient_content as Record<NutrientKey, number>).forEach(([nutrient, value]) => {
          acc[displayDate][nutrient as NutrientKey] += value;
        });

        return acc;
      }, {});

      setMeals(grouped);
      setDailyNutrients(dailyTotals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const isToday = (date: string) => {
    return format(new Date(), 'yyyy-MM-dd') === date;
  };

  const isYesterday = (date: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, 'yyyy-MM-dd') === date;
  };

  const getImageUrl = (meal: Meal) => {
    return supabase.storage
      .from('uploaded-images')
      .getPublicUrl(`${meal.user_id}/${meal.image_id}.jpg`).data.publicUrl;
  };

  const formatAmount = (nutrient: NutrientKey, value: number) => {
    const { target, unit } = TARGET_NUTRIENTS[nutrient];
    return {
      achieved: `${value}`,
      target: `${target}`,
      unit
    };
  };

  const handleMealPress = (meal: Meal) => {
    router.push({
      pathname: '/meal-details',
      params: {
        id: meal.id,
        imageUri: getImageUrl(meal),
        time: format(parseISO(meal.created_at), 'h:mm a'),
        nutrients: JSON.stringify(meal.nutrient_content),
        name: meal.notes
      }
    });
  };

  const renderMealList = () => (
    <ScrollView style={styles.scrollContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0368F0" />
          <ThemedText style={styles.loadingText}>Loading meals...</ThemedText>
        </View>
      ) : Object.entries(meals).length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="tray.fill" size={48} color="#666" />
          <ThemedText style={styles.emptyText}>No meals logged yet</ThemedText>
        </View>
      ) : (
        Object.entries(meals).map(([date, dayMeals]) => (
          <View key={date}>
            <ThemedText style={styles.dateHeader}>{date}</ThemedText>
            {dayMeals.map((meal) => (
              <TouchableOpacity 
                key={meal.id} 
                style={styles.mealCard}
                onPress={() => handleMealPress(meal)}
              >
                <Image 
                  source={{ uri: getImageUrl(meal) }} 
                  style={styles.mealImage}
                />
                <View style={styles.mealInfo}>
                  <ThemedText style={styles.mealName}>
                    {meal.notes || 'Meal'}
                  </ThemedText>
                  <ThemedText style={styles.time}>
                    {format(parseISO(meal.created_at), 'h:mm a')}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderNutrientList = () => (
    <ScrollView style={styles.scrollContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0368F0" />
          <ThemedText style={styles.loadingText}>Loading nutrients...</ThemedText>
        </View>
      ) : Object.entries(dailyNutrients).length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="chart.bar.fill" size={48} color="#666" />
          <ThemedText style={styles.emptyText}>No nutrient data available</ThemedText>
        </View>
      ) : (
        Object.entries(dailyNutrients).map(([date, nutrients]) => (
          <View key={date} style={styles.nutrientDateGroup}>
            <ThemedText style={styles.dateHeader}>{date}</ThemedText>
            <View style={styles.nutrientCard}>
              {Object.entries(nutrients).map(([nutrient, value]) => {
                const nutrientKey = nutrient as NutrientKey;
                const { target } = TARGET_NUTRIENTS[nutrientKey];
                const formatted = formatAmount(nutrientKey, value);
                return (
                  <View key={nutrient} style={styles.nutrientRow}>
                    <ThemedText style={styles.nutrientName}>{nutrient}</ThemedText>
                    <View style={styles.nutrientValueContainer}>
                      <ThemedText 
                        style={[
                          styles.nutrientValue,
                          value >= target ? styles.nutrientValueHigh : styles.nutrientValueLow
                        ]}
                      >
                        {formatted.achieved}
                      </ThemedText>
                      <ThemedText style={styles.nutrientSeparator}>/</ThemedText>
                      <ThemedText style={styles.nutrientTarget}>
                        {formatted.target}
                      </ThemedText>
                      <ThemedText style={styles.nutrientUnit}>
                        {formatted.unit}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">History</ThemedText>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'meals' && styles.activeTab]}
          onPress={() => setActiveTab('meals')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'meals' && styles.activeTabText]}>
            Meals
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'nutrients' && styles.activeTab]}
          onPress={() => setActiveTab('nutrients')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'nutrients' && styles.activeTabText]}>
            Nutrients
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'meals' ? renderMealList() : renderNutrientList()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#0368F0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
  },
  mealImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  mealInfo: {
    flex: 1,
    marginLeft: 16,
  },
  time: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  nutrientDateGroup: {
    marginBottom: 20,
  },
  nutrientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nutrientName: {
    fontSize: 16,
    color: '#333',
  },
  nutrientValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  nutrientValueHigh: {
    color: '#34C759', // Green
  },
  nutrientValueLow: {
    color: '#FF3B30', // Red
  },
  nutrientSeparator: {
    fontSize: 16,
    color: '#666',
  },
  nutrientTarget: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0368F0', // Blue
  },
  nutrientUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 2,
  },
}); 