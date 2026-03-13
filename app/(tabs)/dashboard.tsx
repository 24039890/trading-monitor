// app/(tabs)/dashboard.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/theme';
import { getEAStatus, subscribeToStatus } from '../../services/eaService';
import { EAStatus } from '../../types';
import RobotBackground from '../../components/Robotbackground';

function n(val: any, decimals = 2): string {
  const num = parseFloat(val);
  if (isNaN(num)) return '0.' + '0'.repeat(decimals);
  return num.toFixed(decimals);
}
function safeNum(val: any): number {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

export default function DashboardScreen() {
  const [status,      setStatus]      = useState<EAStatus | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const s = await getEAStatus();
      setStatus(s);
      setLastRefresh(new Date());
    } catch (e) { console.log('[Dashboard] error:', e); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    const sub = subscribeToStatus((s) => { setStatus(s); setLastRefresh(new Date()); });
    return () => { clearInterval(interval); sub.unsubscribe(); };
  }, [load]);

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false); }

  const bal      = safeNum(status?.balance);
  const equity   = safeNum(status?.equity);
  const pl       = safeNum(status?.total_pl);
  const plPos    = pl >= 0;
  const plPct    = bal > 0 ? ((equity - bal) / bal * 100) : 0;
  const asianH   = safeNum(status?.asian_high);
  const asianL   = safeNum(status?.asian_low);
  const pdh      = safeNum(status?.prev_day_high);
  const pdl      = safeNum(status?.prev_day_low);
  const currency = (status as any)?.currency ?? 'USD';
  const pipsRange = asianH > 0 && asianL > 0
    ? ((asianH - asianL) * 10000).toFixed(1) : '—';

  return (
    <SafeAreaView style={s.safe}>
      {/* Robot background — always visible */}
      <RobotBackground />

      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary}/>}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>📈 Trading Monitor</Text>
            <Text style={s.headerSub}>SAST · {status?.symbol ?? '—'}</Text>
          </View>
          <View style={[s.badge, status?.ea_enabled ? s.badgeOn : s.badgeOff]}>
            <Text style={s.badgeText}>{status?.ea_enabled ? '● ACTIVE' : '● STOPPED'}</Text>
          </View>
        </View>

        <Text style={s.updated}>Updated: {lastRefresh.toLocaleTimeString('en-ZA')}</Text>

        {!status ? (
          <View style={s.noData}>
            <Text style={s.noDataEmoji}>📡</Text>
            <Text style={s.noDataText}>Waiting for EA data...</Text>
            <Text style={s.noDataSub}>Make sure MT5 is running with Bridge EA</Text>
          </View>
        ) : (
          <>
            <View style={s.row}>
              <StatCard label="Balance" value={currency + ' ' + n(bal)} />
              <StatCard label="Equity"  value={currency + ' ' + n(equity)} />
            </View>

            <View style={[s.card, { borderColor: plPos ? Colors.profit+'44' : Colors.loss+'44' }]}>
              <Text style={s.cardLabel}>Floating P&L</Text>
              <Text style={[s.plValue, { color: plPos ? Colors.profit : Colors.loss }]}>
                {plPos ? '+' : ''}{currency} {n(pl)}
              </Text>
              <Text style={[s.plPct, { color: plPos ? Colors.profit : Colors.loss }]}>
                {plPos ? '+' : ''}{n(plPct)}% from balance
              </Text>
            </View>

            <View style={s.row}>
              <StatCard label="Session"
                value={status.in_session ? '🟢 Active' : '🔴 Closed'}
                color={status.in_session ? Colors.profit : Colors.loss}/>
              <StatCard label="Trades Today" value={(status.trades_today ?? 0) + ' / 3'}/>
            </View>

            <View style={s.row}>
              <StatCard label="Open Trades" value={String(status.open_trades ?? 0)}/>
              <StatCard label="EA Status"
                value={status.ea_enabled ? '✅ Running' : '⏹ Stopped'}
                color={status.ea_enabled ? Colors.profit : Colors.warning}/>
            </View>

            {/* SL / TP levels card */}
            <View style={[s.card, s.slCard]}>
              <Text style={s.cardLabel}>📏 SL / TP LEVELS</Text>
              <View style={s.levelRow}>
                <View style={[s.levelDot, { backgroundColor: '#FF4444' }]}/>
                <Text style={s.levelLabel}>STOP LOSS</Text>
                <Text style={[s.levelValue, { color: '#FF4444' }]}>
                  {(status as any)?.sl_price ? n((status as any).sl_price, 2) : '—'}
                </Text>
                <Text style={s.levelPips}>
                  {(status as any)?.sl_pips ? (status as any).sl_pips + ' pips' : '3× ATR'}
                </Text>
              </View>
              <View style={s.levelDivider}/>
              <View style={s.levelRow}>
                <View style={[s.levelDot, { backgroundColor: Colors.primary }]}/>
                <Text style={s.levelLabel}>ENTRY</Text>
                <Text style={[s.levelValue, { color: Colors.text }]}>
                  {(status as any)?.entry_price ? n((status as any).entry_price, 2) : '—'}
                </Text>
                <Text style={s.levelPips}>current trade</Text>
              </View>
              <View style={s.levelDivider}/>
              <View style={s.levelRow}>
                <View style={[s.levelDot, { backgroundColor: Colors.profit }]}/>
                <Text style={s.levelLabel}>TP1  (50% close)</Text>
                <Text style={[s.levelValue, { color: Colors.profit }]}>
                  {(status as any)?.tp1_price ? n((status as any).tp1_price, 2) : '—'}
                </Text>
                <Text style={s.levelPips}>
                  {(status as any)?.tp1_pips ? (status as any).tp1_pips + ' pips' : '2× ATR'}
                </Text>
              </View>
              <View style={s.levelDivider}/>
              <View style={s.levelRow}>
                <View style={[s.levelDot, { backgroundColor: '#FFD700' }]}/>
                <Text style={s.levelLabel}>TP2  (trailing)</Text>
                <Text style={[s.levelValue, { color: '#FFD700' }]}>
                  {(status as any)?.trail_price ? n((status as any).trail_price, 2) : 'TRAILING'}
                </Text>
                <Text style={s.levelPips}>rides trend</Text>
              </View>
              {!(status as any)?.entry_price && (
                <Text style={s.noTrade}>No active trade — levels appear when EA opens a position</Text>
              )}
            </View>

            {/* Asian Range */}
            <View style={s.card}>
              <Text style={s.cardLabel}>📊 Asian Range (SAST 02:00–07:00)</Text>
              {status.asian_range_set ? (
                <>
                  <View style={s.rangeRow}>
                    <View style={[s.rangeDot, { backgroundColor: Colors.danger }]}/>
                    <Text style={s.rangeLabel}>Asian High</Text>
                    <Text style={s.rangeValue}>{n(asianH, 5)}</Text>
                  </View>
                  <View style={s.rangeRow}>
                    <View style={[s.rangeDot, { backgroundColor: Colors.primary }]}/>
                    <Text style={s.rangeLabel}>Asian Low</Text>
                    <Text style={s.rangeValue}>{n(asianL, 5)}</Text>
                  </View>
                  <View style={s.rangeRow}>
                    <Text style={s.rangeLabel}>Range</Text>
                    <Text style={s.rangeValue}>{pipsRange} pips</Text>
                  </View>
                </>
              ) : (
                <Text style={s.noRange}>Waiting for 02:00–07:00 SAST</Text>
              )}
            </View>

            <View style={s.card}>
              <Text style={s.cardLabel}>💧 Liquidity Sweep</Text>
              <View style={s.sweepRow}>
                <SweepBadge label="High Swept" active={!!status.high_swept}/>
                <SweepBadge label="Low Swept"  active={!!status.low_swept}/>
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardLabel}>📅 Previous Day Levels</Text>
              <View style={s.rangeRow}>
                <View style={[s.rangeDot, { backgroundColor: Colors.danger }]}/>
                <Text style={s.rangeLabel}>PDH</Text>
                <Text style={s.rangeValue}>{n(pdh, 5)}</Text>
              </View>
              <View style={s.rangeRow}>
                <View style={[s.rangeDot, { backgroundColor: Colors.primary }]}/>
                <Text style={s.rangeLabel}>PDL</Text>
                <Text style={s.rangeValue}>{n(pdl, 5)}</Text>
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardLabel}>⏰ Session Times (SAST)</Text>
              <SessionRow name="Asian Range"     time="02:00 – 07:00"/>
              <SessionRow name="London Killzone" time="09:00 – 12:00"/>
              <SessionRow name="NY Killzone"     time="14:00 – 17:00"/>
              <Text style={s.tzNote}>🇿🇦 SAST = UTC+2 · No daylight saving</Text>
            </View>
          </>
        )}
        <View style={{ height: 40 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={sc.wrap}>
      <Text style={sc.label}>{label}</Text>
      <Text style={[sc.value, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap:  { flex: 1, backgroundColor: Colors.card+'CC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder },
  label: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: Fonts.lg, fontWeight: '800', color: Colors.text },
});

function SweepBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={[sb.wrap, {
      backgroundColor: active ? Colors.warning+'22' : Colors.card+'CC',
      borderColor:     active ? Colors.warning       : Colors.cardBorder,
    }]}>
      <Text style={[sb.text, { color: active ? Colors.warning : Colors.textDim }]}>
        {active ? '⚡' : '○'} {label}
      </Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, margin: 4 },
  text: { fontSize: Fonts.sm, fontWeight: '700' },
});

function SessionRow({ name, time }: { name: string; time: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder }}>
      <Text style={{ color: Colors.textMuted, fontSize: Fonts.sm }}>{name}</Text>
      <Text style={{ color: Colors.primary, fontSize: Fonts.sm, fontWeight: '700' }}>{time}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  scroll:      { flex: 1, padding: 16 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: Fonts.xl, fontWeight: '800', color: Colors.text },
  headerSub:   { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 2 },
  badge:       { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeOn:     { backgroundColor: Colors.profit+'22' },
  badgeOff:    { backgroundColor: Colors.danger+'22' },
  badgeText:   { fontSize: Fonts.xs, fontWeight: '800', color: Colors.text },
  updated:     { fontSize: Fonts.xs, color: Colors.textDim, marginBottom: 16 },
  row:         { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card:        { backgroundColor: Colors.card+'CC', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  cardLabel:   { fontSize: Fonts.xs, color: Colors.textMuted, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  plValue:     { fontSize: Fonts.xxxl, fontWeight: '900', marginBottom: 4 },
  plPct:       { fontSize: Fonts.sm, fontWeight: '600' },
  rangeRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  rangeDot:    { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  rangeLabel:  { flex: 1, color: Colors.textMuted, fontSize: Fonts.sm },
  rangeValue:  { color: Colors.text, fontSize: Fonts.md, fontWeight: '700' },
  noRange:     { color: Colors.textDim, fontSize: Fonts.sm, fontStyle: 'italic' },
  sweepRow:    { flexDirection: 'row', gap: 8 },
  tzNote:      { color: Colors.textDim, fontSize: Fonts.xs, marginTop: 10, textAlign: 'center' },
  noData:      { alignItems: 'center', paddingVertical: 80 },
  noDataEmoji: { fontSize: 56, marginBottom: 16 },
  noDataText:  { color: Colors.text, fontSize: Fonts.xl, fontWeight: '700', marginBottom: 8 },
  noDataSub:   { color: Colors.textMuted, fontSize: Fonts.sm, textAlign: 'center' },
  warning:     { color: Colors.warning },
  // SL/TP card
  slCard:      { borderColor: '#FF444433' },
  levelRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  levelDot:    { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  levelLabel:  { flex: 1, color: Colors.textMuted, fontSize: Fonts.sm, fontWeight: '600' },
  levelValue:  { fontSize: Fonts.md, fontWeight: '800', marginRight: 8 },
  levelPips:   { fontSize: Fonts.xs, color: Colors.textDim, fontStyle: 'italic' },
  levelDivider:{ height: 1, backgroundColor: Colors.cardBorder },
  noTrade:     { color: Colors.textDim, fontSize: Fonts.xs, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
});