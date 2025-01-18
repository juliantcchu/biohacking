import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ReviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  const handleConfirm = () => {
    // TODO: Save the photo and log the supplement intake
    router.replace('/(tabs)');
  };

  const handleRetake = () => {
    router.back();
  };

  // Dummy nutrient data
  const nutrients = [
    { name: 'Omega-3', amount: '1.2g', dailyValue: '60%' },
    { name: 'Phosphatidylserine', amount: '200mg', dailyValue: '67%' },
    { name: 'Choline', amount: '400mg', dailyValue: '80%' },
    { name: 'Creatine', amount: '3g', dailyValue: '60%' },
    { name: 'Vitamin D3', amount: '2000IU', dailyValue: '50%' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: photoUri }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.nutrientContainer}>
          <ThemedText style={styles.title}>Nutrient Content</ThemedText>
          {nutrients.map((nutrient, index) => (
            <View key={index} style={styles.nutrientRow}>
              <ThemedText style={styles.nutrientName}>{nutrient.name}</ThemedText>
              <View style={styles.nutrientValues}>
                <ThemedText style={styles.amount}>{nutrient.amount}</ThemedText>
                <ThemedText style={styles.dailyValue}>{nutrient.dailyValue}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRetake}
        >
          <IconSymbol name="arrow.counterclockwise" size={24} color="#666" />
          <ThemedText>Retake</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.confirmButton]} 
          onPress={handleConfirm}
        >
          <IconSymbol name="checkmark" size={24} color="white" />
          <ThemedText style={styles.confirmText}>Confirm</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#ccc',

  },
  nutrientContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nutrientName: {
    fontSize: 16,
    flex: 1,
  },
  nutrientValues: {
    flexDirection: 'row',
    gap: 16,
  },
  amount: {
    fontSize: 16,
    color: '#666',
  },
  dailyValue: {
    fontSize: 16,
    color: '#0368F0',
    width: 50,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#0368F0',
  },
  confirmText: {
    color: 'white',
  },
});