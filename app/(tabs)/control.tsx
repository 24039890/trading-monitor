// app/(tabs)/control.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/theme';
import { getEAStatus, sendCommand } from '../../services/eaService';
import { authService } from '../../services/authService';
import { router } from 'expo-router';
import { EAStatus, EACommand } from '../../types';

export default function ControlScreen() {
  const [status,  setStatus]  = useState<EAStatus | null>(null);
  const [loading, setLoading] = useState<EACommand | null>(null);
  const [lastCmd, setLastCmd] = useState('');

  const load = useCallback(async () => {
    const s = await getEAStatus();
    setStatus(s);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  async function sendCmd(cmd: EACommand, confirmMsg?: string) {
    if (confirmMsg) {
      Alert.alert('Confirm', confirmMsg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'destructive', onPress: () => executeCmd(cmd) },
      ]);
    } else {
      executeCmd(cmd);
    }
  }

  async function executeCmd(cmd: EACommand) {
    setLoading(cmd);
    const result = await sendCommand(cmd);
    setLoading(null);
    if (result.success) {
      setLastCmd(`✅ "${cmd}" sent at ${new Date().toLocaleTimeString('en-ZA')}`);
      setTimeout(load, 2000); // Refresh status after 2s
    } else {
      setLastCmd(`❌ Failed: ${result.message}`);
    }
  }

  async function logout() {
    await authService.logout();
    router.replace('/(auth)/login');
  }

  const isEnabled = status?.ea_enabled ?? false;
  const openCount = status?.open_trades ?? 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll}>
        <Text style={s.title}>🎮 EA Control Panel</Text>
        <Text style={s.sub}>South Africa (SAST · UTC+2)</Text>

        {/* EA Status indicator */}
        <View style={[s.statusBanner, { backgroundColor: isEnabled ? Colors.profit + '15' : Colors.danger + '15', borderColor: isEnabled ? Colors.profit + '40' : Colors.danger + '40' }]}>
          <View style={[s.statusDot, { backgroundColor: isEnabled ? Colors.profit : Colors.danger }]} />
          <View style={{ flex: 1 }}>
            <Text style={[s.statusTitle, { color: isEnabled ? Colors.profit : Colors.danger }]}>
              EA is {isEnabled ? 'RUNNING' : 'STOPPED'}
            </Text>
            <Text style={s.statusSub}>
              {status ? `${status.symbol} · ${status.open_trades} open trade${status.open_trades !== 1 ? 's' : ''}` : 'Connecting to VPS...'}
            </Text>
          </View>
          {!status && <ActivityIndicator color={Colors.primary} />}
        </View>

        {/* Main Controls */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>MAIN CONTROLS</Text>

          {/* Start/Stop toggle */}
          {isEnabled ? (
            <ControlBtn
              emoji="⏹"
              label="Stop EA"
              sublabel="EA will stop opening new trades"
              color={Colors.danger}
              loading={loading === 'DISABLE'}
              onPress={() => sendCmd('DISABLE', 'Stop the EA from trading?')}
            />
          ) : (
            <ControlBtn
              emoji="▶️"
              label="Start EA"
              sublabel="EA will resume trading in active sessions"
              color={Colors.profit}
              loading={loading === 'ENABLE'}
              onPress={() => sendCmd('ENABLE')}
            />
          )}

          {/* Close All */}
          <ControlBtn
            emoji="🚨"
            label="Close All Trades"
            sublabel={openCount > 0 ? `Will close ${openCount} open position${openCount !== 1 ? 's' : ''}` : 'No open trades to close'}
            color={Colors.warning}
            loading={loading === 'CLOSE_ALL'}
            disabled={openCount === 0}
            onPress={() => sendCmd('CLOSE_ALL',
              `Close all ${openCount} open trade${openCount !== 1 ? 's' : ''} immediately? This cannot be undone.`
            )}
          />

          {/* Refresh Status */}
          <ControlBtn
            emoji="🔄"
            label="Refresh Status"
            sublabel="Request latest data from EA"
            color={Colors.primary}
            loading={loading === 'STATUS'}
            onPress={() => sendCmd('STATUS')}
          />
        </View>

        {/* Last command result */}
        {!!lastCmd && (
          <View style={s.lastCmd}>
            <Text style={s.lastCmdText}>{lastCmd}</Text>
          </View>
        )}

        {/* Account Summary */}
        {status && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>ACCOUNT SUMMARY</Text>
            <View style={s.infoCard}>
              <InfoRow label="Symbol"        value={status.symbol} />
              <InfoRow label="Balance"       value={'R ' + status.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} />
              <InfoRow label="Equity"        value={'R ' + status.equity.toLocaleString('en-ZA',  { minimumFractionDigits: 2 })} />
              <InfoRow label="Open Trades"   value={String(status.open_trades)} />
              <InfoRow label="Trades Today"  value={status.trades_today + ' / 3'} />
              <InfoRow label="In Session"    value={status.in_session ? '✅ Yes' : '❌ No'} />
              <InfoRow label="Asian Range"   value={status.asian_range_set ? '✅ Set' : '⏳ Waiting'} last />
            </View>
          </View>
        )}

        {/* Session Times Reference */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>SESSION TIMES (SAST)</Text>
          <View style={s.infoCard}>
            <InfoRow label="Asian Range"     value="02:00 – 07:00" />
            <InfoRow label="London Killzone" value="09:00 – 12:00" />
            <InfoRow label="NY Killzone"     value="14:00 – 17:00" last />
          </View>
          <Text style={s.tzNote}>🇿🇦 No daylight saving in South Africa · Always UTC+2</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ControlBtn({ emoji, label, sublabel, color, loading, disabled = false, onPress }: {
  emoji: string; label: string; sublabel: string; color: string;
  loading: boolean; disabled?: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[cb.btn, { borderColor: color + '40', opacity: disabled ? 0.4 : 1 }]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.75}
    >
      <View style={[cb.iconWrap, { backgroundColor: color + '20' }]}>
        {loading ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <Text style={cb.emoji}>{emoji}</Text>
        )}
      </View>
      <View style={cb.textWrap}>
        <Text style={[cb.label, { color }]}>{label}</Text>
        <Text style={cb.sub}>{sublabel}</Text>
      </View>
    </TouchableOpacity>
  );
}
const cb = StyleSheet.create({
  btn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  emoji:    { fontSize: 22 },
  textWrap: { flex: 1 },
  label:    { fontSize: Fonts.md, fontWeight: '800', marginBottom: 3 },
  sub:      { fontSize: Fonts.xs, color: Colors.textMuted },
});

function InfoRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[ir.row, !last && ir.border]}>
      <Text style={ir.label}>{label}</Text>
      <Text style={ir.value}>{value}</Text>
    </View>
  );
}
const ir = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  label:  { color: Colors.textMuted, fontSize: Fonts.sm },
  value:  { color: Colors.text, fontSize: Fonts.sm, fontWeight: '700' },
});

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  scroll:       { flex: 1, padding: 16 },
  title:        { fontSize: Fonts.xxl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  sub:          { fontSize: Fonts.sm, color: Colors.textMuted, marginBottom: 20 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, gap: 12 },
  statusDot:    { width: 12, height: 12, borderRadius: 6 },
  statusTitle:  { fontSize: Fonts.lg, fontWeight: '800' },
  statusSub:    { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 2 },
  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: Fonts.xs, color: Colors.textDim, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  infoCard:     { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  lastCmd:      { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: Colors.cardBorder },
  lastCmdText:  { color: Colors.textMuted, fontSize: Fonts.sm, textAlign: 'center' },
  tzNote:       { color: Colors.textDim, fontSize: Fonts.xs, textAlign: 'center', marginTop: 10 },
  logoutBtn:    { borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  logoutText:   { color: Colors.textMuted, fontSize: Fonts.md, fontWeight: '700' },
});
