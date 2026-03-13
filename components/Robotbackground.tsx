// components/RobotBackground.tsx
// Animated SVG robot rendered as a background layer
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Rect, Circle, Line, Path, G, Ellipse, Polygon, Text as SvgText
} from 'react-native-svg';

export default function RobotBackground() {
  const pulse   = useRef(new Animated.Value(0)).current;
  const scanY   = useRef(new Animated.Value(0)).current;
  const eyeGlow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse,   { toValue: 1,   duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse,   { toValue: 0,   duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanY,   { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanY,   { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(eyeGlow, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(eyeGlow, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.container} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 800">

        {/* ── Grid lines background ── */}
        {[...Array(12)].map((_,i) => (
          <Line key={'h'+i} x1="0" y1={i*70} x2="400" y2={i*70}
            stroke="#00D4AA" strokeOpacity="0.04" strokeWidth="1"/>
        ))}
        {[...Array(8)].map((_,i) => (
          <Line key={'v'+i} x1={i*57} y1="0" x2={i*57} y2="800"
            stroke="#00D4AA" strokeOpacity="0.04" strokeWidth="1"/>
        ))}

        {/* ── Robot — centered, large, ghostly ── */}
        <G opacity="0.07" transform="translate(80, 120)">

          {/* Antenna */}
          <Line x1="120" y1="0" x2="120" y2="30" stroke="#00D4AA" strokeWidth="4"/>
          <Circle cx="120" cy="0" r="8" fill="#00D4AA"/>

          {/* Head */}
          <Rect x="70" y="30" width="100" height="80" rx="16"
            fill="none" stroke="#00D4AA" strokeWidth="3"/>

          {/* Eyes */}
          <Circle cx="100" cy="65" r="12" fill="#00D4AA" opacity="0.6"/>
          <Circle cx="140" cy="65" r="12" fill="#00D4AA" opacity="0.6"/>
          <Circle cx="100" cy="65" r="5"  fill="#0A0E1A"/>
          <Circle cx="140" cy="65" r="5"  fill="#0A0E1A"/>

          {/* Mouth — chart line */}
          <Rect x="88" y="90" width="64" height="10" rx="5"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
          <Path d="M90 95 L102 90 L110 95 L120 88 L130 95 L140 90 L150 95"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>

          {/* Neck */}
          <Rect x="108" y="110" width="24" height="15" rx="4"
            fill="#00D4AA" opacity="0.4"/>

          {/* Body */}
          <Rect x="50" y="125" width="140" height="120" rx="16"
            fill="none" stroke="#00D4AA" strokeWidth="3"/>

          {/* Chest screen */}
          <Rect x="70" y="140" width="100" height="70" rx="8"
            fill="#00D4AA" opacity="0.08" stroke="#00D4AA" strokeWidth="1.5"/>

          {/* Chart bars in chest */}
          <Rect x="78"  y="183" width="12" height="20" rx="2" fill="#00D4AA" opacity="0.5"/>
          <Rect x="94"  y="170" width="12" height="33" rx="2" fill="#00D4AA" opacity="0.7"/>
          <Rect x="110" y="178" width="12" height="25" rx="2" fill="#00D4AA" opacity="0.5"/>
          <Rect x="126" y="162" width="12" height="41" rx="2" fill="#00D4AA" opacity="0.8"/>
          <Rect x="142" y="173" width="12" height="30" rx="2" fill="#00D4AA" opacity="0.6"/>

          {/* Body buttons */}
          <Circle cx="85"  cy="228" r="6" fill="#00D4AA" opacity="0.5"/>
          <Circle cx="120" cy="228" r="6" fill="#FF4444" opacity="0.5"/>
          <Circle cx="155" cy="228" r="6" fill="#00D4AA" opacity="0.5"/>

          {/* Left arm */}
          <Rect x="10" y="130" width="35" height="60" rx="10"
            fill="none" stroke="#00D4AA" strokeWidth="2.5"/>
          <Rect x="15" y="190" width="28" height="40" rx="8"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
          {/* Left hand holding chart */}
          <Rect x="8" y="228" width="40" height="28" rx="8"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
          <Path d="M14 242 L20 236 L26 242 L32 234 L38 242 L44 237"
            fill="none" stroke="#00D4AA" strokeWidth="1.5"/>

          {/* Right arm */}
          <Rect x="195" y="130" width="35" height="60" rx="10"
            fill="none" stroke="#00D4AA" strokeWidth="2.5"/>
          <Rect x="197" y="190" width="28" height="40" rx="8"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
          {/* Right hand holding phone */}
          <Rect x="192" y="228" width="40" height="28" rx="6"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
          <Rect x="197" y="232" width="30" height="20" rx="3"
            fill="#00D4AA" opacity="0.15"/>
          <Line x1="200" y1="238" x2="224" y2="238" stroke="#00D4AA" strokeWidth="1.5"/>
          <Line x1="200" y1="244" x2="218" y2="244" stroke="#00D4AA" strokeWidth="1.5"/>

          {/* Legs */}
          <Rect x="80"  y="245" width="40" height="55" rx="10"
            fill="none" stroke="#00D4AA" strokeWidth="2.5"/>
          <Rect x="120" y="245" width="40" height="55" rx="10"
            fill="none" stroke="#00D4AA" strokeWidth="2.5"/>

          {/* Feet */}
          <Rect x="70"  y="298" width="55" height="20" rx="8"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
          <Rect x="115" y="298" width="55" height="20" rx="8"
            fill="none" stroke="#00D4AA" strokeWidth="2"/>
        </G>

        {/* ── Floating candlestick chart top right ── */}
        <G opacity="0.06" transform="translate(260, 60)">
          {[
            [10, 40, 20, 60],
            [30, 30, 15, 50],
            [50, 50, 20, 65],
            [70, 20, 10, 45],
            [90, 35, 18, 55],
          ].map(([x, y, h, full], i) => (
            <G key={i}>
              <Line x1={x+5} y1={y-10} x2={x+5} y2={y+h+10}
                stroke="#00D4AA" strokeWidth="1.5"/>
              <Rect x={x} y={y} width="10" height={h} rx="2"
                fill={i%2===0 ? "#00D4AA" : "#FF4444"} opacity="0.8"/>
            </G>
          ))}
          <Line x1="0" y1="80" x2="110" y2="80"
            stroke="#00D4AA" strokeWidth="1" strokeDasharray="4,4"/>
        </G>

        {/* ── Corner circuit decorations ── */}
        <G opacity="0.08">
          <Path d="M0 0 L40 0 L40 10 L10 10 L10 40 L0 40 Z"
            fill="none" stroke="#00D4AA" strokeWidth="1.5"/>
          <Path d="M400 0 L360 0 L360 10 L390 10 L390 40 L400 40 Z"
            fill="none" stroke="#00D4AA" strokeWidth="1.5"/>
          <Path d="M0 800 L40 800 L40 790 L10 790 L10 760 L0 760 Z"
            fill="none" stroke="#00D4AA" strokeWidth="1.5"/>
          <Path d="M400 800 L360 800 L360 790 L390 790 L390 760 L400 760 Z"
            fill="none" stroke="#00D4AA" strokeWidth="1.5"/>
        </G>

        {/* ── Bottom watermark ── */}
        <SvgText x="200" y="780" textAnchor="middle"
          fill="#00D4AA" opacity="0.08" fontSize="11" fontFamily="Courier New">
          ICT TRADING MONITOR · SAST
        </SvgText>

      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
  },
});