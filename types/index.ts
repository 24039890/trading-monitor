// types/index.ts

export interface EAStatus {
  ea_version: string;
  symbol: string;
  ea_enabled: boolean;
  sast_time: string;
  balance: number;
  equity: number;
  open_trades: number;
  total_pl: number;
  trades_today: number;
  asian_high: number;
  asian_low: number;
  asian_range_set: boolean;
  high_swept: boolean;
  low_swept: boolean;
  in_session: boolean;
  prev_day_high: number;
  prev_day_low: number;
  last_updated: string;
}

export interface Trade {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  open_price: number;
  current_price: number;
  sl: number;
  tp: number;
  profit: number;
  open_time: string;
}

export type EACommand = 'ENABLE' | 'DISABLE' | 'CLOSE_ALL' | 'STATUS';

export interface CommandResult {
  success: boolean;
  message: string;
  timestamp: string;
}
