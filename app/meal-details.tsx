import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function MealDetailsScreen() {
  const { imageUri, date, name } = useLocalSearchParams<{ 
    imageUri: string;
    date: string;
    name: string;
  }>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{name}</ThemedText>
        <View style={styles.backButton} />
      </View>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.date}>{date}</ThemedText>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Nutrients</ThemedText>
            <View style={styles.nutrientList}>
              <View style={styles.nutrientItem}>
                <ThemedText style={styles.nutrientName}>Omega-3</ThemedText>
                <ThemedText style={styles.nutrientAmount}>1.2g</ThemedText>
              </View>
              <View style={styles.nutrientItem}>
                <ThemedText style={styles.nutrientName}>Vitamin D3</ThemedText>
                <ThemedText style={styles.nutrientAmount}>2000IU</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  imageContainer: {
    padding: 16
  },
  content: {
    padding: 16,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nutrientList: {
    gap: 12,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nutrientName: {
    fontSize: 16,
  },
  nutrientAmount: {
    fontSize: 16,
    color: '#0368F0',
    fontWeight: '500',
  },
}); 