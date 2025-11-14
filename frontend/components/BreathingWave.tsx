import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ProgressCircle from './ProgressCircle';

type BreathingWaveProps = {
    amplitude?: number;                 // possibly use the audio recording for the amplitude
    progress : Animated.Value
};

export default function BreathingWave({ amplitude, progress }: BreathingWaveProps) {
    
    // Initialise the dimensions of the breathing wave box
    const width = 250;
    const height = 250;

    // Default amplitude when not using mic
    const baseAmplitude = 40; 

    // BreathingWave State variables
    const [phase, setPhase] = useState(0);
    const [currentAmplitude, setCurrentAmplitude] = useState(baseAmplitude);

    const phaseAnim = useRef(new Animated.Value(0)).current;

    // Simulates an infinite wave animation
    useEffect(() => {
        Animated.loop(
            Animated.timing(phaseAnim, {
                toValue: 2 * Math.PI,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        ).start();
    }, []);

    // Read animated phase
    useEffect(() => {
        const id = phaseAnim.addListener(({ value }) => setPhase(value));
        return () => phaseAnim.removeListener(id);
    }, []);

    // Self-running amplitude modulation if no external data
    useEffect(() => {
        if (amplitude !== undefined) {
            setCurrentAmplitude(amplitude);
            return;
        }

        const ampAnim = new Animated.Value(baseAmplitude);
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(ampAnim, {
                    toValue: baseAmplitude * 0.6,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.timing(ampAnim, {
                    toValue: baseAmplitude,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }),
            ])
        );
        loop.start();

        const id = ampAnim.addListener(({ value }) => setCurrentAmplitude(value));
        return () => {
            loop.stop();
            ampAnim.removeListener(id);
        };
    }, [amplitude]);

    // Generate continuous sine wave
    const generateWavePath = (width: number, amplitude: number, phase: number) => {
        const baseY = height / 2;
        const cycles = 4; // number of sine cycles across width
        let path = `M0 ${baseY + Math.sin(phase) * amplitude}`;

        for (let x = 0; x <= width; x++) {
            const y =
                baseY +
                Math.sin((x / width) * cycles * Math.PI * 2 + phase) * amplitude;
            path += ` L${x} ${y}`;
        }

        return path;
    };

    const wavePath = generateWavePath(width, currentAmplitude, phase);

    return (
        <View
            style={{
                alignSelf: "center",
                width: width,
                height: height,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 16,
                backgroundColor: "#F0F4FF",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            <Svg height={height} width={width}>
                <Path d={wavePath} stroke="#93C5FD" strokeWidth={2.5} fill="none" />
            </Svg>
            <ProgressCircle progress={progress}/>
        </View>
    );
}
