
// app/(auth)/login.tsx
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  // Shake animation for error
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function login() {
    if (!email.trim() || !pass) {
      setError('Please enter your email and password.');
      shake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.login(email.trim(), pass);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      const msg: string = e.message ?? '';
      if (msg.includes('Invalid login credentials'))
        setError('Incorrect email or password. Please try again.');
      else if (msg.includes('Email not confirmed'))
        setError('Please confirm your email address first.');
      else if (msg.includes('Too many requests'))
        setError('Too many attempts. Please wait a moment.');
      else
        setError(msg || 'Something went wrong. Please try again.');
      shake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo & Header ── */}
          <View style={s.header}>
            <View style={s.logoRing}>
              <View style={s.logoInner}>
                <Text style={s.logoText}>📈</Text>
              </View>
            </View>
            <Text style={s.appName}>ICT Trading Monitor</Text>
            <View style={s.tagRow}>
              <View style={s.tagDot} />
              <Text style={s.tagText}>South Africa  ·  SAST (UTC+2)</Text>
              <View style={s.tagDot} />
            </View>
          </View>

          {/* ── Form Card ── */}
          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>

            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in to monitor your EA</Text>

            {/* Error banner */}
            {!!error && (
              <View style={s.errBanner}>
                <Text style={s.errIcon}>!</Text>
                <Text style={s.errMsg}>{error}</Text>
              </View>
            )}

            {/* Email field */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={[s.inputWrap, emailFocus && s.inputFocused]}>
                <Text style={s.inputIcon}>✉</Text>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textDim}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password field */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>PASSWORD</Text>
              <View style={[s.inputWrap, passFocus && s.inputFocused]}>
                <Text style={s.inputIcon}>🔑</Text>
                <TextInput
                  style={s.input}
                  value={pass}
                  onChangeText={setPass}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textDim}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={login}
                />
                {/* Professional eye toggle */}
                <TouchableOpacity
                  style={s.eyeToggle}
                  onPress={() => setShowPass(v => !v)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={[s.eyeTrack, showPass && s.eyeTrackActive]}>
                    <View style={[s.eyeThumb, showPass && s.eyeThumbActive]} />
                  </View>
                  <Text style={[s.eyeLabel, showPass && s.eyeLabelActive]}>
                    {showPass ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In button */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnLoading]}
              onPress={login}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={s.btnText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

          </Animated.View>

          {/* Footer */}
          <View style={s.footer}>
            <View style={s.footerDot} />
            <Text style={s.footerText}>Secured by Supabase</Text>
            <View style={s.footerDot} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },

  // Header
  header:    { alignItems: 'center', marginBottom: 44 },
  logoRing:  {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 1.5, borderColor: Colors.primary + '50',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary, shadowOpacity: 0.3,
    shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  logoInner: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  logoText:  { fontSize: 32 },
  appName:   { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: 0.5, marginBottom: 10 },
  tagRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagDot:    { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary },
  tagText:   { fontSize: 12, color: Colors.textMuted, letterSpacing: 0.8, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: Colors.textMuted, marginBottom: 28 },

  // Error
  errBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  errIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.danger,
    color: '#fff',
    fontSize: 13, fontWeight: '900',
    textAlign: 'center', lineHeight: 22,
  },
  errMsg: { flex: 1, color: Colors.danger, fontSize: 13, fontWeight: '600', lineHeight: 18 },

  // Fields
  fieldWrap:    { marginBottom: 18 },
  fieldLabel:   { fontSize: 10, fontWeight: '800', color: Colors.textDim, letterSpacing: 1.2, marginBottom: 8 },
  inputWrap:    {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14, height: 54,
  },
  inputFocused: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  inputIcon:    { fontSize: 16, marginRight: 10 },
  input:        { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },

  // Eye toggle — pill switch style
  eyeToggle:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 },
  eyeTrack:       {
    width: 36, height: 20, borderRadius: 10,
    backgroundColor: Colors.cardBorder,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  eyeTrackActive: { backgroundColor: Colors.primary + '40' },
  eyeThumb:       {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.textDim,
    alignSelf: 'flex-start',
  },
  eyeThumbActive: { backgroundColor: Colors.primary, alignSelf: 'flex-end' },
  eyeLabel:       { fontSize: 10, fontWeight: '800', color: Colors.textDim, letterSpacing: 0.8, width: 28 },
  eyeLabelActive: { color: Colors.primary },

  // Button
  btn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  btnLoading: { opacity: 0.7 },
  btnText:    { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },

  // Footer
  footer:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 36, gap: 8 },
  footerDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textDim },
  footerText: { fontSize: 11, color: Colors.textDim, letterSpacing: 0.6 },
});