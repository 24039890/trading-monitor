// app/(tabs)/trades.tsx
import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/theme';
import { getOpenTrades, subscribeToTrades } from '../../services/eaService';
import { Trade } from '../../types';

export default function TradesScreen() {
  const [trades,     setTrades]     = useState<Trade[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPL,    setTotalPL]    = useState(0);

  const load = useCallback(async () => {
    const t = await getOpenTrades();
    setTrades(t);
    setTotalPL(t.reduce((sum, tr) => sum + tr.profit, 0));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    const sub = subscribeToTrades((t) => {
      setTrades(t);
      setTotalPL(t.reduce((sum, tr) => sum + tr.profit, 0));
    });
    return () => { clearInterval(interval); sub.unsubscribe(); };
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const plPos = totalPL >= 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={s.title}>📋 Open Trades</Text>

        {/* Summary bar */}
        <View style={s.summary}>
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Open</Text>
            <Text style={s.summaryValue}>{trades.length}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Total P&L</Text>
            <Text style={[s.summaryValue, { color: plPos ? Colors.profit : Colors.loss }]}>
              {plPos ? '+' : ''}R {totalPL.toFixed(2)}
            </Text>
          </View>
          <View style={s.divider} />
          <View style={s.summaryItem}>
            <Text style={s.summaryLabel}>Updates</Text>
            <Text style={s.summaryValue}>Live</Text>
          </View>
        </View>

        {trades.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>💤</Text>
            <Text style={s.emptyTitle}>No Open Trades</Text>
            <Text style={s.emptySub}>The EA has no active positions right now.</Text>
          </View>
        ) : (
          trades.map((trade) => <TradeCard key={trade.ticket} trade={trade} />)
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TradeCard({ trade }: { trade: Trade }) {
  const isBuy   = trade.type === 'BUY';
  const plPos   = trade.profit >= 0;
  const pips    = isBuy
    ? ((trade.current_price - trade.open_price) * 10000)
    : ((trade.open_price - trade.current_price) * 10000);

  return (
    <View style={[tc.card, { borderLeftColor: isBuy ? Colors.buy : Colors.sell }]}>
      {/* Top row */}
      <View style={tc.topRow}>
        <View style={[tc.typeBadge, { backgroundColor: isBuy ? Colors.buy + '22' : Colors.sell + '22' }]}>
          <Text style={[tc.typeText, { color: isBuy ? Colors.buy : Colors.sell }]}>
            {isBuy ? '▲ BUY' : '▼ SELL'}
          </Text>
        </View>
        <Text style={tc.ticket}>#{trade.ticket}</Text>
        <Text style={[tc.pl, { color: plPos ? Colors.profit : Colors.loss }]}>
          {plPos ? '+' : ''}R {trade.profit.toFixed(2)}
        </Text>
      </View>

      {/* Symbol + Lots */}
      <View style={tc.row}>
        <Text style={tc.symbol}>{trade.symbol}</Text>
        <Text style={tc.lots}>{trade.lots} lots</Text>
      </View>

      {/* Price grid */}
      <View style={tc.grid}>
        <PriceItem label="Open"    value={trade.open_price.toFixed(5)} />
        <PriceItem label="Current" value={trade.current_price.toFixed(5)} highlight />
        <PriceItem label="Pips"    value={(pips >= 0 ? '+' : '') + pips.toFixed(1)} color={plPos ? Colors.profit : Colors.loss} />
      </View>

      <View style={tc.grid}>
        <PriceItem label="Stop Loss"   value={trade.sl > 0 ? trade.sl.toFixed(5) : '—'} color={Colors.loss} />
        <PriceItem label="Take Profit" value={trade.tp > 0 ? trade.tp.toFixed(5) : '—'} color={Colors.profit} />
        <PriceItem label="Lots"        value={String(trade.lots)} />
      </View>

      {/* Open time */}
      <Text style={tc.time}>
        Opened: {new Date(trade.open_time).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
      </Text>
    </View>
  );
}

function PriceItem({ label, value, highlight = false, color }: {
  label: string; value: string; highlight?: boolean; color?: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: Fonts.xs, color: Colors.textDim, marginBottom: 3 }}>{label}</Text>
      <Text style={{
        fontSize: Fonts.sm, fontWeight: '700',
        color: color ?? (highlight ? Colors.primary : Colors.text),
        fontVariant: ['tabular-nums'],
      }}>{value}</Text>
    </View>
  );
}

const tc = StyleSheet.create({
  card:      { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder, borderLeftWidth: 4 },
  topRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  typeText:  { fontSize: Fonts.sm, fontWeight: '800' },
  ticket:    { flex: 1, color: Colors.textDim, fontSize: Fonts.xs },
  pl:        { fontSize: Fonts.lg, fontWeight: '900' },
  symbol:    { fontSize: Fonts.xl, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  lots:      { fontSize: Fonts.sm, color: Colors.textMuted, marginBottom: 12 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid:      { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.bg, borderRadius: 10, padding: 10, marginBottom: 8 },
  time:      { fontSize: Fonts.xs, color: Colors.textDim, marginTop: 4 },
});

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  scroll:       { flex: 1, padding: 16 },
  title:        { fontSize: Fonts.xxl, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  summary:      { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.cardBorder },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: Fonts.xs, color: Colors.textDim, marginBottom: 4, fontWeight: '600' },
  summaryValue: { fontSize: Fonts.lg, fontWeight: '800', color: Colors.text },
  divider:      { width: 1, backgroundColor: Colors.cardBorder },
  empty:        { alignItems: 'center', paddingVertical: 80 },
  emptyEmoji:   { fontSize: 56, marginBottom: 16 },
  emptyTitle:   { fontSize: Fonts.xl, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub:     { color: Colors.textMuted, fontSize: Fonts.sm, textAlign: 'center' },
});
