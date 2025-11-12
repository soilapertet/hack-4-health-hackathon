import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 10 }}>
        Breathing Monitor
      </Text>
      <Text>Track and analyze your breathing patterns.</Text>

      <Link href="/monitor" style={{ marginTop: 20, color: '#4C9EEB' }}>
        Go to Monitor
      </Link>
    </View>
  );
}
