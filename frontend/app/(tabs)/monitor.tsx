import { View, Text } from 'react-native';

export default function Monitor() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600' }}>Monitor Breathing</Text>
      <Text>Start recording your breathing sounds here.</Text>
    </View>
  );
}
