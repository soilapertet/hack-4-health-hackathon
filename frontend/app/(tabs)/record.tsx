import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BreathingWave from '../../components/BreathingWave';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function Record() {

    // Record State variables
    const [isConnecting, setIsConnecting] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isWaitingForData, setIsWaitingForData] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progress = useRef(new Animated.Value(0)).current;

    // Reset states when user switches to a different tab
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                // Screen is unfocused or unmounted
                setIsConnecting(true);
                setIsRecording(false);
                setIsWaitingForData(false);
                progress.setValue(0);
            };
        }, [])
    );

    // Add loading animation to simulate connecting to microphone
    useEffect(() => {
        if (isConnecting) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
        }
    }, []);

    // Simulate connecting to microphone
    // Duration = 4 seconds  (dummy data)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsConnecting(false);
            setIsRecording(true);
        }, 4000);                       // subject to change

        return () => clearTimeout(timer);
    }, [isConnecting]);

    // Simulate actual recording of breathing
    // Duration = 15 seconds (dummy data)
    useEffect(() => {
        if (isRecording) {
            Animated.timing(progress, {
                toValue: 100,
                duration: 15000,      // subject to change
                useNativeDriver: false
            }).start()
        }
    }, [isRecording])

    // Once recording is done, send audio recording to backend
    // Program will wait from response from backend before updating the state variable -> isWaitingForData
    useEffect(() => {
        const listener = progress.addListener(({ value }) => {
            if (value >= 100) {
                setTimeout(() => {
                    setIsRecording(false);
                    setIsWaitingForData(true);
                }, 500);
            }
        })

        return () => progress.removeListener(listener);
    }, []);

    return (
        <>
            {/* Display loading animation when in 'isConnecting' state */}
            {isConnecting && (
                <View style={styles.container}>
                    <View style={styles.center}>
                        <Text style={styles.heading}>Connecting to microphone...</Text>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={[styles.text, { marginTop: 10 }]}>
                            Setting up recording for breathing patterns.
                        </Text>
                    </View>
                </View>
            )}

            {/* Display breathing wave form pattern when in 'isRecording' state */}
            {isRecording && (
                <>
                    <View style={styles.container}>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={styles.heading}>Recording in progress...</Text>
                            <Text style={styles.text}>Monitoring your current breathing condition.</Text>
                        </View>
                        <BreathingWave progress={progress} />
                        <TouchableOpacity style={styles.stopButton}>
                            <Ionicons name="stop" size={24} color="#F8FAFC" />
                            <Text style={styles.stopText}>STOP</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Display loading animation when in 'isWaitingForData' state */}
            {isWaitingForData && (
                <View style={styles.container}>
                    <View style={styles.center}>
                        <Text style={styles.heading}>Analyzing breathing patterns...</Text>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={[styles.text, { marginTop: 10 }]}>
                            Checking for abnormal breathing events.
                        </Text>
                    </View>
                </View>
            )}
        </>
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
        color: '#272635',
        textAlign: 'center',
        marginBottom: 10
    },
    text: {
        color: '#272635',
        textAlign: 'center',
        fontWeight: '600'
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: '700',
        backgroundColor: '#93C5FD'
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
        elevation: 25,
    },
    percentText: {
        color: "#272635",
        position: 'absolute',
        bottom: 57,
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EF4444", // red
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
        position: 'absolute',
        alignSelf: "center",
        bottom: 30
    },
    stopText: {
        color: "#F8FAFC",
        fontWeight: "600",
        fontSize: 16,
        marginLeft: 8,
    },
})