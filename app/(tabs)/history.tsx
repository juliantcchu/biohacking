import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, FlatList, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_SIZE = 80;

// Dummy data for logged meals grouped by date
const LOGGED_MEALS = {
  'Today': [
    {
      id: 1,
      time: '2:30 PM',
      imageUri: 'https://picsum.photos/400/400',
      name: 'Fish Oil Capsules',
      nutrients: [
        { name: 'Omega-3', amount: '1.2g' },
        { name: 'Vitamin D3', amount: '2000IU' },
      ]
    },
    {
      id: 2, 
      time: '9:30 AM',
      imageUri: 'https://picsum.photos/401/400',
      name: 'Morning Supplements',
      nutrients: [
        { name: 'Creatine', amount: '5g' },
        { name: 'Choline', amount: '300mg' },
      ]
    }
  ],
  'Yesterday': [
    {
      id: 3,
      time: '3:45 PM', 
      imageUri: 'https://picsum.photos/402/400',
      name: 'Evening Stack',
      nutrients: [
        { name: 'Phosphatidylserine', amount: '200mg' },
        { name: 'Omega-3', amount: '0.8g' },
      ]
    }
  ]
};

// Dummy data for daily nutrient totals
const DAILY_NUTRIENTS = [
  {
    date: 'Today',
    fullDate: '2024-01-17',
    nutrients: [
      { name: 'Omega-3', amount: '2.0g', target: '2.0g' },
      { name: 'Vitamin D3', amount: '2000IU', target: '4000IU' },
      { name: 'Creatine', amount: '5g', target: '5g' },
      { name: 'Choline', amount: '300mg', target: '500mg' },
    ]
  },
  {
    date: 'Yesterday',
    fullDate: '2024-01-16',
    nutrients: [
      { name: 'Omega-3', amount: '0.8g', target: '2.0g' },
      { name: 'Phosphatidylserine', amount: '200mg', target: '300mg' },
      { name: 'Vitamin D3', amount: '1000IU', target: '4000IU' },
    ]
  },
  {
    date: 'Jan 15',
    fullDate: '2024-01-15',
    nutrients: [
      { name: 'Omega-3', amount: '1.5g', target: '2.0g' },
      { name: 'Vitamin D3', amount: '3000IU', target: '4000IU' },
    ]
  }
];

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedDate, setSelectedDate] = useState(0);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleMealPress = (meal: typeof LOGGED_MEALS['Today'][0]) => {
    router.push({
      pathname: '/meal-details',
      params: {
        id: meal.id,
        imageUri: meal.imageUri,
        time: meal.time,
        name: meal.name,
      }
    });
  };

  const renderMealList = () => (
    <ScrollView style={styles.scrollContainer}>
      {Object.entries(LOGGED_MEALS).map(([date, meals]) => (
        <View key={date}>
          <ThemedText style={styles.dateHeader}>{date}</ThemedText>
          {meals.map((meal) => (
            <TouchableOpacity 
              key={meal.id} 
              style={styles.mealCard}
              onPress={() => handleMealPress(meal)}
            >
              <Image 
                source={{ uri: meal.imageUri }} 
                style={styles.mealImage}
              />
              <View style={styles.mealInfo}>
                <ThemedText style={styles.mealName}>{meal.name}</ThemedText>
                <ThemedText style={styles.time}>{meal.time}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const handlePrevDate = () => {
    if (selectedDate < DAILY_NUTRIENTS.length - 1) {
      setSelectedDate(selectedDate + 1);
    }
  };

  const handleNextDate = () => {
    if (selectedDate > 0) {
      setSelectedDate(selectedDate - 1);
    }
  };

  const renderNutrientList = () => (
    <View style={styles.nutrientContainer}>
      <View style={styles.dateNavigator}>
        <TouchableOpacity 
          onPress={handlePrevDate}
          style={styles.dateArrow}
        >
          <IconSymbol size={24} name="chevron.left" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setDatePickerVisible(true)}
          style={styles.datePickerButton}
        >
          <ThemedText style={styles.dateHeader}>
            {DAILY_NUTRIENTS[selectedDate].date}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleNextDate}
          style={styles.dateArrow}
        >
          <IconSymbol size={24} name="chevron.right" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setSelectedDate(newIndex);
        }}
      >
        {DAILY_NUTRIENTS.map((day, index) => (
          <View key={day.date} style={[styles.nutrientPage, { width: SCREEN_WIDTH }]}>
            {day.nutrients.map((nutrient, i) => (
              <View key={i} style={styles.nutrientRow}>
                <ThemedText style={styles.nutrientName}>{nutrient.name}</ThemedText>
                <ThemedText style={styles.nutrientAmount}>
                  {nutrient.amount} / {nutrient.target}
                </ThemedText>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={datePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalHeader}>Select Date</ThemedText>
            {DAILY_NUTRIENTS.map((day, index) => (
              <TouchableOpacity
                key={day.date}
                style={styles.dateOption}
                onPress={() => {
                  setSelectedDate(index);
                  setDatePickerVisible(false);
                }}
              >
                <ThemedText style={[
                  styles.dateOptionText,
                  selectedDate === index && styles.selectedDateText
                ]}>
                  {day.date} ({day.fullDate})
                </ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDatePickerVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dateArrow: {
    padding: 10,
  },
  dateArrowText: {
    fontSize: 24,
    fontWeight: '600',
  },
  datePickerButton: {
    flex: 1,
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 15,
    color: '#666',
  },
  nutrientContainer: {
    flex: 1,
  },
  nutrientPage: {
    padding: 16,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nutrientName: {
    fontSize: 16,
    fontWeight: '500',
  },
  nutrientAmount: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateOptionText: {
    fontSize: 16,
  },
  selectedDateText: {
    color: '#0368F0',
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0368F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 