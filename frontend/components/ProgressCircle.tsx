import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

type ProgressCircleProps = {
    size?: number;
    strokeWidth?: number;
    duration?: number;
    progress: Animated.Value;
}
export default function ProgressCircle({
    size = 50,
    strokeWidth = 3,
    progress
}: ProgressCircleProps) {

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    const [percentValue, setPercentValue] = useState(0);

    // Listen to animation updates
    useEffect(() => {
        const id = progress.addListener(({ value }) => {
            setPercentValue(Math.round(value));
        });

        return () => {
            progress.removeListener(id);
        };
    }, []);

    const strokeDashOffset =
        progress.interpolate({
            inputRange: [0, 100],
            outputRange: [circumference, 0],
        });

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <G rotation="-90" originX={size / 2} originY={size / 2}>
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#ef4444"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashOffset}
                            strokeLinecap="round"
                            fill="none"
                        />
                    </G>
                </Svg>

                <Animated.Text style={styles.text}>
                    {percentValue}%
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
        width: 70,
        height: 70,
        position: "relative",
    },
    text: {
        position: "absolute",
        textAlign: "center",
        color: "#272635",
        fontSize: 16,
        fontWeight: "700",
    },
});
