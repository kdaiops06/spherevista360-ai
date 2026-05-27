export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function sma(series: number[], period: number): number | null {
  if (series.length < period) {
    return null;
  }
  const sample = series.slice(series.length - period);
  return Number((sample.reduce((acc, n) => acc + n, 0) / period).toFixed(4));
}

export function ema(series: number[], period: number): number | null {
  if (series.length < period) {
    return null;
  }
  const k = 2 / (period + 1);
  let current = series[0];
  for (let i = 1; i < series.length; i += 1) {
    current = series[i] * k + current * (1 - k);
  }
  return Number(current.toFixed(4));
}

export function rsi(series: number[], period = 14): number | null {
  if (series.length <= period) {
    return null;
  }
  let gains = 0;
  let losses = 0;
  for (let i = series.length - period; i < series.length; i += 1) {
    const delta = series[i] - series[i - 1];
    if (delta >= 0) {
      gains += delta;
    } else {
      losses += Math.abs(delta);
    }
  }
  if (losses === 0) {
    return 100;
  }
  const rs = gains / losses;
  return Number((100 - 100 / (1 + rs)).toFixed(2));
}

export function macdTrend(series: number[]): "bullish" | "bearish" | "neutral" {
  const fast = ema(series, 12);
  const slow = ema(series, 26);
  if (fast == null || slow == null) {
    return "neutral";
  }
  if (fast > slow) {
    return "bullish";
  }
  if (fast < slow) {
    return "bearish";
  }
  return "neutral";
}

export function volatilityPercent(series: number[]): number | null {
  if (series.length < 2) {
    return null;
  }
  const high = Math.max(...series);
  const low = Math.min(...series);
  if (low <= 0) {
    return null;
  }
  return Number((((high - low) / low) * 100).toFixed(2));
}

export function maxDrawdownPercent(series: number[]): number | null {
  if (series.length < 2) {
    return null;
  }
  let peak = series[0];
  let maxDrawdown = 0;
  for (const value of series) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = peak > 0 ? ((peak - value) / peak) * 100 : 0;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  return Number(maxDrawdown.toFixed(2));
}
