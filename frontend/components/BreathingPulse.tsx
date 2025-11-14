import { useRef, useEffect, useState } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type BreathingPulseProps = {
    expandValue?: number;
    duration?: number;
};

export default function BreathingPulse({ expandValue = 1.3, duration = 6000 }: BreathingPulseProps) {
    const outerPulse = useRef(new Animated.Value(1)).current;
    // Outer breathing pulse
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(outerPulse, {
                    toValue: expandValue,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(outerPulse, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <>
            <Animated.View style={[styles.outerCircle, { transform: [{ scale: outerPulse }] }]}>
                <View style={styles.monitorContainer}>
                    <Text style={styles.buttonText}>START</Text>
                    <MaterialIcons name="mic" size={60} color={'#F8FAFC'} />
                </View>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    outerCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#93C5FD',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 25,
    },
    monitorContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    buttonText: {
        color: "#F8FAFC",
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center",
    },
    percentage: {
        color: '#F8FAFC',
        fontSize: 36,
        fontWeight: '800',
    },
    waveContainer: {
        position: 'absolute',
        bottom: 40, // places it right beneath the text
        alignItems: 'center',
    },
    waveSvg: {
        position: 'absolute',
        bottom: 0,
    },
    textContainer: {
        position: 'relative',
        alignItems: 'center',
    },
});
