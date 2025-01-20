import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ProgressBar } from './ui/ProgressBar';
import { useRouter } from 'expo-router';

interface NutrientCardProps {
  name: string;
  purpose: string;
  current: number;
  target: number;
  unit: string;
}

export function NutrientCard({ name, purpose, current, target, unit }: NutrientCardProps) {
  const router = useRouter();
  const progress = Math.min(current / target, 1);

  const handlePress = () => {
    router.push({
      pathname: '/nutrient-details',
      params: { nutrientName: name }
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{name}</ThemedText>
        <ThemedText style={styles.amount}>
          {current}/{target} {unit}
        </ThemedText>
      </View>
      <ProgressBar progress={progress} />
      <ThemedText style={styles.purpose}>{purpose}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    color: '#666',
  },
  purpose: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
}); 