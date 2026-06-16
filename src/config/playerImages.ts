const playerColors: Record<string, string> = {
  'marco-rossi': '#E8600A',
  'andrea-bianchi': '#2196F3',
  'lorenzo-verdi': '#4CAF50',
  'filippo-neri': '#9C27B0',
  'matteo-gialli': '#FFC107',
  'alessandro-moretti': '#E91E63',
  'davide-conti': '#00BCD4',
  'simone-marini': '#FF5722',
  'luca-fontana': '#3F51B5',
  'tommaso-rinaldi': '#009688',
  'stefano-bellini': '#795548',
  'nicola-rizzo': '#607D8B',
};

export function getPlayerInitials(playerName: string): string {
  const parts = playerName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getPlayerColor(playerName: string): string | null {
  const key = playerName.toLowerCase().replace(/\s+/g, '-');
  return playerColors[key] ?? null;
}
