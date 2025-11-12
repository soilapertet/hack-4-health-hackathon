import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';

//  Button Colour: #93C5FD
//  Font Colour: #F8FAFC
export default function Home() {

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue : 1,
          duration : 1500,
          easing : Easing.inOut(Easing.ease),
          useNativeDriver : true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.heading}>Respira</Text>
        <Text style={styles.text}>Track and analyze your breathing patterns.</Text>
      </View>
      <Animated.View style={[styles.outerCircle, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/monitor")}>
          <Text style={styles.buttonText}>START MONITOR</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
    flexDirection: 'column',
    gap: 20,
    justifyContent: 'center',
    alignItems : 'center',
    backgroundColor : '#F8FAFC'
  }, 
  heading: { 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 10,
    color: '#272635',
    textAlign: 'center'
  },
  text : {
    color : '#272635',
    textAlign: 'center',
    fontWeight: '600'
  },
  outerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#93C5FD", // subtle glow tint
    shadowColor: "#3B82F6",     // deeper blue shadow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 25, // for Android
  },
  buttonText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
})