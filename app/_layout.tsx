 //app/_layout.tsx
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const [session, setSession] = useState<any>(undefined);
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return; // still loading

    const inAuth = segments[0] === '(auth)';

    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && inAuth) {
      router.replace('/(tabs)/dashboard');
    }
  }, [session, segments]);

  if (session === undefined) return null; // loading

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Slot />
    </>
  );
}