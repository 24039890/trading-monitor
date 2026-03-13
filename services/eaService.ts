// services/eaService.ts
import { supabase } from '../lib/supabase';
import { EAStatus, Trade, EACommand, CommandResult } from '../types';

// ─────────────────────────────────────────────────────────────────
// READ EA STATUS
// EA writes to ea_status table every tick
// ─────────────────────────────────────────────────────────────────
export async function getEAStatus(): Promise<EAStatus | null> {
  const { data, error } = await supabase
    .from('ea_status')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.status as EAStatus;
}

// ─────────────────────────────────────────────────────────────────
// READ OPEN TRADES
// EA writes open positions to ea_trades table
// ─────────────────────────────────────────────────────────────────
export async function getOpenTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('ea_trades')
    .select('*')
    .eq('is_open', true)
    .order('open_time', { ascending: false });

  if (error || !data) return [];
  return data as Trade[];
}

// ─────────────────────────────────────────────────────────────────
// SEND COMMAND TO EA
// Mobile app writes command → EA reads and executes
// ─────────────────────────────────────────────────────────────────
export async function sendCommand(command: EACommand): Promise<CommandResult> {
  const { error } = await supabase
    .from('ea_commands')
    .insert({
      command,
      executed: false,
      created_at: new Date().toISOString(),
    });

  if (error) {
    return {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    message: `Command "${command}" sent successfully`,
    timestamp: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────
// SUBSCRIBE TO LIVE STATUS UPDATES
// Real-time updates via Supabase Realtime
// ─────────────────────────────────────────────────────────────────
export function subscribeToStatus(callback: (status: EAStatus) => void) {
  return supabase
    .channel('ea_status_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ea_status' },
      (payload) => {
        if (payload.new && (payload.new as any).status) {
          callback((payload.new as any).status as EAStatus);
        }
      }
    )
    .subscribe();
}

// ─────────────────────────────────────────────────────────────────
// SUBSCRIBE TO LIVE TRADE UPDATES
// ─────────────────────────────────────────────────────────────────
export function subscribeToTrades(callback: (trades: Trade[]) => void) {
  return supabase
    .channel('ea_trades_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ea_trades' },
      async () => {
        const trades = await getOpenTrades();
        callback(trades);
      }
    )
    .subscribe();
}
