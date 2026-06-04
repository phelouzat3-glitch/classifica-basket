export const TEAM_LOGOS: Record<string, any> = {
  "union-basket-prato": require("@/assets/images/teams/union-basket-prato.png"),
  "abc-castelfiorentino": require("@/assets/images/teams/abc-castelfiorentino.png"),
  "pallacanestro-prato-dragons": require("@/assets/images/teams/pallacanestro-prato-dragons.png"),
  "pallacanestro-agliana-2000": require("@/assets/images/teams/pallacanestro-agliana-2000.png"),
  "us-livorno-basket": require("@/assets/images/teams/us-livorno-basket.png"),
  "basket-sei-rose-rosignano": require("@/assets/images/teams/basket-sei-rose-rosignano.png"),
  "cus-firenze-basket": require("@/assets/images/teams/cus-firenze-basket.png"),
  "dukes-sansepolcro": require("@/assets/images/teams/dukes-sansepolcro.png"),
  "folgore-fucecchio": require("@/assets/images/teams/folgore-fucecchio.png"),
  "bottegone-basket-2001": require("@/assets/images/teams/bottegone-basket-2001.png"),
  "virtus-certaldo": require("@/assets/images/teams/virtus-certaldo.png"),
  "unione-sportiva-pino-firenze": require("@/assets/images/teams/unione-sportiva-pino-firenze.png"),
  "sancat-basket-firenze": require("@/assets/images/teams/sancat-basket-firenze.png"),
  "valdisieve-basket": require("@/assets/images/teams/valdisieve-basket.png"),
  "fides-montevarchi": require("@/assets/images/teams/fides-montevarchi.png"),
  "don-bosco-livorno": require("@/assets/images/teams/don-bosco-livorno.png"),
  "basket-san-vincenzo": require("@/assets/images/teams/basket-san-vincenzo.png"),
};

const TEAM_NAME_TO_ID: Record<string, string> = {
  "Union Basket Prato": "union-basket-prato",
  "Abc Castelfiorentino": "abc-castelfiorentino",
  "Pallacanestro Prato Dragons": "pallacanestro-prato-dragons",
  "Pallacanestro Prato": "pallacanestro-prato-dragons",
  "Pallacanestro Agliana 2000": "pallacanestro-agliana-2000",
  "US Livorno Basket": "us-livorno-basket",
  "Basket Sei Rose Rosignano": "basket-sei-rose-rosignano",
  "Sei Rose Rosignano": "basket-sei-rose-rosignano",
  "Cus Firenze Basket": "cus-firenze-basket",
  "CUS Firenze": "cus-firenze-basket",
  "Dukes Sansepolcro": "dukes-sansepolcro",
  "Folgore Fucecchio": "folgore-fucecchio",
  "Bottegone Basket 2001": "bottegone-basket-2001",
  "Virtus Certaldo": "virtus-certaldo",
  "Unione Sportiva Pino Firenze": "unione-sportiva-pino-firenze",
  "Sancat Basket Firenze": "sancat-basket-firenze",
  "Valdisieve Basket": "valdisieve-basket",
  "Fides Montevarchi": "fides-montevarchi",
  "Don Bosco Livorno": "don-bosco-livorno",
  "Basket San Vincenzo": "basket-san-vincenzo",
  "Basket Livorno": "us-livorno-basket",
};

export function getTeamId(name: string): string | undefined {
  const exact = TEAM_NAME_TO_ID[name];
  if (exact) return exact;
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(TEAM_NAME_TO_ID)) {
    if (key.toLowerCase() === lower) return val;
  }
  for (const [key, val] of Object.entries(TEAM_NAME_TO_ID)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase()))
      return val;
  }
  return undefined;
}

export function getTeamLogo(name: string): any {
  const id = getTeamId(name);
  return id ? TEAM_LOGOS[id] : undefined;
}
