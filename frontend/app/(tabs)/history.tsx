import { View, Text } from 'react-native';

export default function History() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Breathing History</Text>
      <Text>View past analysis results.</Text>
    </View>
  );
}
