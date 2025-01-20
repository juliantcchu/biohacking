import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { NUTRIENTS } from '@/lib/nutrients';

type NutrientEstimates = {
  [K in keyof typeof NUTRIENTS]: number
}

export default function ReviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const [loading, setLoading] = useState(true);
  const [imageId, setImageId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<NutrientEstimates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzeImage();
  }, []);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      setError(null);

      // Read the image file and convert to base64
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call the edge function
      const { data, error: functionError } = await supabase.functions.invoke('estimate-nutrient-content', {
        body: { user_id: user.id, image_base64: base64 }
      });

      if (functionError) throw functionError;
      
      setImageId(data.image_id);
      setEstimates(data.estimates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      console.error('Error analyzing image:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      if (!imageId) return;
      
      const { error: updateError } = await supabase
        .from('meals')
        .update({ confirmed: true })
        .eq('image_id', imageId);

      if (updateError) throw updateError;
      
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error confirming meal:', err);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  const formatAmount = (nutrient: keyof NutrientEstimates, value: number) => {
    const nutrientInfo = NUTRIENTS[nutrient];
    return `${value}${nutrientInfo.unit}`;
  };

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0368F0" />
              <ThemedText style={styles.loadingText}>Analyzing nutrient contents...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.triangle" size={24} color="#FF3B30" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : estimates && (
            Object.entries(estimates).map(([nutrient, value], index) => (
              <View key={index} style={styles.nutrientRow}>
                <ThemedText style={styles.nutrientName}>{nutrient}</ThemedText>
                <View style={styles.nutrientValues}>
                  <ThemedText style={styles.amount}>
                    {formatAmount(nutrient as keyof NutrientEstimates, value)}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
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
          style={[
            styles.button, 
            styles.confirmButton,
            (loading || !!error) && styles.disabledButton
          ]} 
          onPress={handleConfirm}
          disabled={loading || !!error}
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmText: {
    color: 'white',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});