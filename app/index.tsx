// app/index.tsx
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Colors, Fonts } from '../constants/theme';

export default function SplashScreen() {
  // Animations
  const fadeIn      = useRef(new Animated.Value(0)).current;
  const robotBounce = useRef(new Animated.Value(0)).current;
  const robotGlow   = useRef(new Animated.Value(0)).current;
  const bar1        = useRef(new Animated.Value(0.3)).current;
  const bar2        = useRef(new Animated.Value(0.6)).current;
  const bar3        = useRef(new Animated.Value(0.4)).current;
  const bar4        = useRef(new Animated.Value(0.8)).current;
  const bar5        = useRef(new Animated.Value(0.5)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const scanLine    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in everything
    Animated.timing(fadeIn, {
      toValue: 1, duration: 800,
      useNativeDriver: true,
    }).start();

    // Robot bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(robotBounce, { toValue: -12, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(robotBounce, { toValue: 0,   duration: 600, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(robotGlow, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(robotGlow, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Animated chart bars
    function animateBar(anim: Animated.Value, delay: number) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: Math.random() * 0.5 + 0.5, duration: 400 + Math.random() * 400, delay, useNativeDriver: false }),
          Animated.timing(anim, { toValue: Math.random() * 0.3 + 0.2, duration: 400 + Math.random() * 400, useNativeDriver: false }),
        ])
      ).start();
    }
    animateBar(bar1, 0);
    animateBar(bar2, 150);
    animateBar(bar3, 300);
    animateBar(bar4, 100);
    animateBar(bar5, 250);

    // Dots blinking
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsOpacity, { toValue: 1,   duration: 500, useNativeDriver: true }),
        Animated.timing(dotsOpacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    // Scan line
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ])
    ).start();

    // Check auth and navigate after 3 seconds
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const glowStyle = {
    opacity: robotGlow,
    shadowColor: Colors.primary,
    shadowOpacity: 1,
    shadowRadius: 30,
  };

  const scanTranslate = scanLine.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 120],
  });

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.container, { opacity: fadeIn }]}>

        {/* Title */}
        <Text style={s.title}>ICT Trading</Text>
        <Text style={s.titleAccent}>Monitor</Text>
        <Text style={s.subtitle}>SOUTH AFRICA · SAST (UTC+2)</Text>

        {/* Robot */}
        <Animated.View style={[s.robotWrap, { transform: [{ translateY: robotBounce }] }]}>

          {/* Glow ring */}
          <Animated.View style={[s.glowRing, glowStyle]} />

          {/* Robot body */}
          <View style={s.robot}>

            {/* Head */}
            <View style={s.head}>
              {/* Antenna */}
              <View style={s.antennaWrap}>
                <View style={s.antennaStem} />
                <Animated.View style={[s.antennaBall, { opacity: robotGlow }]} />
              </View>
              {/* Face */}
              <View style={s.face}>
                {/* Eyes */}
                <View style={s.eyesRow}>
                  <Animated.View style={[s.eye, { opacity: robotGlow }]} />
                  <Animated.View style={[s.eye, { opacity: robotGlow }]} />
                </View>
                {/* Mouth — chart line */}
                <View style={s.mouth}>
                  <View style={s.mouthLine} />
                </View>
              </View>
            </View>

            {/* Neck */}
            <View style={s.neck} />

            {/* Body */}
            <View style={s.body}>
              {/* Chest screen — mini chart */}
              <View style={s.chestScreen}>
                {/* Scan line effect */}
                <Animated.View style={[s.scanLine, { transform: [{ translateY: scanTranslate }] }]} />
                {/* Chart bars */}
                <View style={s.chartBars}>
                  {[bar1, bar2, bar3, bar4, bar5].map((bar, i) => (
                    <Animated.View
                      key={i}
                      style={[s.bar, {
                        height: bar.interpolate({ inputRange: [0, 1], outputRange: [4, 40] }),
                        backgroundColor: i === 3 ? Colors.profit : i === 1 ? Colors.loss : Colors.primary,
                      }]}
                    />
                  ))}
                </View>
                {/* Ticker text */}
                <Text style={s.ticker}>XAUUSD</Text>
              </View>

              {/* Body buttons */}
              <View style={s.bodyButtons}>
                <Animated.View style={[s.bodyBtn, { opacity: robotGlow }]} />
                <View style={[s.bodyBtn, { backgroundColor: Colors.loss }]} />
                <Animated.View style={[s.bodyBtn, { opacity: robotGlow }]} />
              </View>
            </View>

            {/* Arms */}
            <View style={s.armsRow}>
              <View style={s.armLeft}>
                <View style={s.armUpper} />
                <View style={s.armLower} />
                <View style={s.hand}>
                  <Text style={{ fontSize: 14 }}>📊</Text>
                </View>
              </View>
              <View style={s.armRight}>
                <View style={s.armUpper} />
                <View style={s.armLower} />
                <View style={s.hand}>
                  <Text style={{ fontSize: 14 }}>📈</Text>
                </View>
              </View>
            </View>

            {/* Legs */}
            <View style={s.legsRow}>
              <View style={s.leg} />
              <View style={s.leg} />
            </View>
            <View style={s.feetRow}>
              <View style={s.foot} />
              <View style={s.foot} />
            </View>

          </View>
        </Animated.View>

        {/* Loading text */}
        <Animated.View style={[s.loadingRow, { opacity: dotsOpacity }]}>
          <Text style={s.loadingText}>Connecting to markets</Text>
          <Text style={s.dots}>●●●</Text>
        </Animated.View>

        {/* Footer */}
        <Text style={s.footer}>🇿🇦 Powered by Supabase + MT5</Text>

      </Animated.View>
    </SafeAreaView>
  );
}

const ROBOT_COLOR    = '#1E3A5F';
const ROBOT_LIGHT    = '#2563EB';
const ROBOT_DARK     = '#0F1F35';
const SCREEN_COLOR   = '#0A0E1A';

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  title:       { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: 1 },
  titleAccent: { fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
  subtitle:    { fontSize: 11, color: Colors.textDim, letterSpacing: 2, fontWeight: '600', marginBottom: 40 },

  // Robot wrapper
  robotWrap: { alignItems: 'center', marginBottom: 40, position: 'relative' },
  glowRing:  {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.primary + '15',
    top: 10,
  },

  // Robot parts
  robot: { alignItems: 'center' },

  // Head
  head:        { alignItems: 'center', marginBottom: 2 },
  antennaWrap: { alignItems: 'center', marginBottom: 2 },
  antennaStem: { width: 4, height: 16, backgroundColor: ROBOT_COLOR, borderRadius: 2 },
  antennaBall: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginBottom: -5 },
  face: {
    width: 80, height: 60,
    backgroundColor: ROBOT_COLOR,
    borderRadius: 14,
    borderWidth: 2, borderColor: ROBOT_LIGHT,
    alignItems: 'center', justifyContent: 'center',
    padding: 8,
  },
  eyesRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  eye: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOpacity: 1, shadowRadius: 6,
  },
  mouth: { width: 40, height: 12, backgroundColor: SCREEN_COLOR, borderRadius: 6, overflow: 'hidden', justifyContent: 'center' },
  mouthLine: { height: 2, width: '80%', backgroundColor: Colors.primary, marginLeft: 4 },

  // Neck
  neck: { width: 20, height: 8, backgroundColor: ROBOT_DARK, borderRadius: 4 },

  // Body
  body: {
    width: 100, height: 90,
    backgroundColor: ROBOT_COLOR,
    borderRadius: 14,
    borderWidth: 2, borderColor: ROBOT_LIGHT,
    alignItems: 'center', justifyContent: 'center',
    padding: 8,
    marginBottom: 2,
  },
  chestScreen: {
    width: 72, height: 52,
    backgroundColor: SCREEN_COLOR,
    borderRadius: 8,
    borderWidth: 1, borderColor: Colors.primary + '60',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 4,
  },
  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2, backgroundColor: Colors.primary + '60',
  },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 40, marginBottom: 2 },
  bar:       { width: 8, borderRadius: 2 },
  ticker:    { fontSize: 7, color: Colors.primary, fontWeight: '800', letterSpacing: 0.5 },
  bodyButtons: { flexDirection: 'row', gap: 6, marginTop: 6 },
  bodyBtn:   { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  // Arms
  armsRow:  { flexDirection: 'row', gap: 8, position: 'absolute', top: 76, width: 160, justifyContent: 'space-between' },
  armLeft:  { alignItems: 'flex-end' },
  armRight: { alignItems: 'flex-start' },
  armUpper: { width: 18, height: 28, backgroundColor: ROBOT_COLOR, borderRadius: 6, borderWidth: 1, borderColor: ROBOT_LIGHT },
  armLower: { width: 14, height: 22, backgroundColor: ROBOT_DARK, borderRadius: 5, borderWidth: 1, borderColor: ROBOT_LIGHT },
  hand:     { width: 24, height: 24, backgroundColor: ROBOT_COLOR, borderRadius: 8, borderWidth: 1, borderColor: ROBOT_LIGHT, alignItems: 'center', justifyContent: 'center' },

  // Legs
  legsRow: { flexDirection: 'row', gap: 16 },
  leg:     { width: 22, height: 28, backgroundColor: ROBOT_COLOR, borderRadius: 6, borderWidth: 1, borderColor: ROBOT_LIGHT },
  feetRow: { flexDirection: 'row', gap: 10 },
  foot:    { width: 28, height: 12, backgroundColor: ROBOT_DARK, borderRadius: 6, borderWidth: 1, borderColor: ROBOT_LIGHT },

  // Loading
  loadingRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  loadingText: { color: Colors.textMuted, fontSize: Fonts.sm, fontWeight: '600', letterSpacing: 0.5 },
  dots:        { color: Colors.primary, fontSize: 10, letterSpacing: 3 },

  footer: { position: 'absolute', bottom: 32, color: Colors.textDim, fontSize: 11, letterSpacing: 0.5 },
});