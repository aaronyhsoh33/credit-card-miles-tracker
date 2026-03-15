export function formatMiles(miles: number | string): string {
  const n = typeof miles === 'string' ? parseFloat(miles) : miles;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(0);
}

export function formatMpd(mpd: number | string): string {
  const n = typeof mpd === 'string' ? parseFloat(mpd) : mpd;
  return `${n.toFixed(1)} mpd`;
}
