import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BreathingPulse from '../../components/BreathingPulse';
import { MaterialIcons } from '@expo/vector-icons';

export default function Home() {

  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 30 }}>
        <Text style={styles.heading}>Respira</Text>
        <Text style={styles.text}>Track and analyze your breathing patterns.</Text>
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/record")}>
        <BreathingPulse expandValue={1.05} />
      </TouchableOpacity>
      <View style={styles.altContainer}>
        <Text style={styles.altText}>Or upload audio from device</Text>
        <TouchableOpacity style={styles.uploadContainer} activeOpacity={0.8} onPress={() => router.push("/record")}>
          <Text style={styles.buttonText}>Upload Audio</Text>
          <MaterialIcons name="upload" size={19} color={'#F8FAFC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC'
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    color: '#272635',
    textAlign: 'center'
  },
  text: {
    color: '#272635',
    textAlign: 'center',
    fontWeight: '600'
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 16,
    backgroundColor: '#274c77',
    padding: 10,
    width: 150,
  },
  buttonText: {
    color: '#F8FAFC',
    fontWeight: '600',
    marginRight: 5
  },
  altContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    alignSelf: "center",
    bottom: 20
  },
  altText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
})