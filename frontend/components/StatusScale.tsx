import { View, StyleSheet } from "react-native";
import Svg, { Path, Line } from "react-native-svg";

type PredictionType = "normal" | "abnormal" | "severe";

const COLORS = {
  normal: "#6EEB83",      // green
  abnormal: "#FFB347",    // yellow
  severe: "#FF5B5B"       // red
};

const ANGLES = {
  normal: [-90, -30],      // segment 1
  abnormal: [-30, 30],     // segment 2
  severe: [30, 90]         // segment 3
};

const POINTER = {
  normal: -60,
  abnormal: 0,
  severe: 60
};

export default function StatusScale({ prediction }: { prediction: PredictionType }) {
  const pivotX = 150;
  const pivotY = 200;
  const radius = 150;

  const [startAngle, endAngle] = ANGLES[prediction];
  const pointerAngle = POINTER[prediction];

  return (
    <View style={styles.container}>
      <Svg width={300} height={220}>

        {/* GREEN */}
        <Path
          d={describeArc(pivotX, pivotY, radius, -90, -30)}
          stroke={COLORS.normal}
          strokeWidth={30}
          fill="none"
        />

        {/* YELLOW */}
        <Path
          d={describeArc(pivotX, pivotY, radius, -30, 30)}
          stroke={COLORS.abnormal}
          strokeWidth={30}
          fill="none"
        />

        {/* RED */}
        <Path
          d={describeArc(pivotX, pivotY, radius, 30, 90)}
          stroke={COLORS.severe}
          strokeWidth={30}
          fill="none"
        />

        {/* NEEDLE */}
        <Line
          x1={pivotX}
          y1={pivotY}
          x2={pivotX + 100 * Math.cos((Math.PI / 180) * (pointerAngle - 90))}
          y2={pivotY + 100 * Math.sin((Math.PI / 180) * (pointerAngle - 90))}
          stroke="#272635"
          strokeWidth={6}
          strokeLinecap="round"
        />

      </Svg>
    </View>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPos = polarToCartesian(cx, cy, r, end);
  const endPos = polarToCartesian(cx, cy, r, start);
  return `M ${startPos.x} ${startPos.y} A ${r} ${r} 0 0 0 ${endPos.x} ${endPos.y}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  }
});
