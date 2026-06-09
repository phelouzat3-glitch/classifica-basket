const playerImages: Record<string, any> = {
  'marco-rossi': require('@/assets/images/players/marco-rossi.jpg'),
  'andrea-bianchi': require('@/assets/images/players/andrea-bianchi.jpg'),
  'lorenzo-verdi': require('@/assets/images/players/lorenzo-verdi.jpg'),
  'filippo-neri': require('@/assets/images/players/filippo-neri.jpg'),
  'matteo-gialli': require('@/assets/images/players/matteo-gialli.jpg'),
  'alessandro-moretti': require('@/assets/images/players/alessandro-moretti.jpg'),
  'davide-conti': require('@/assets/images/players/davide-conti.jpg'),
  'simone-marini': require('@/assets/images/players/simone-marini.jpg'),
  'luca-fontana': require('@/assets/images/players/luca-fontana.jpg'),
  'tommaso-rinaldi': require('@/assets/images/players/tommaso-rinaldi.jpg'),
  'stefano-bellini': require('@/assets/images/players/stefano-bellini.jpg'),
  'nicola-rizzo': require('@/assets/images/players/nicola-rizzo.jpg'),
};

export function getPlayerImage(playerName: string): any | null {
  const key = playerName.toLowerCase().replace(/\s+/g, '-');
  return playerImages[key] ?? null;
}
