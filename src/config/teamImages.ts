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

const TEAM_TO_ID: Record<string, string> = {
  "abc castelfiorentino": "abc-castelfiorentino",
  "pallacanestro agliana 2000": "pallacanestro-agliana-2000",
  "bottegone basket 2001": "bottegone-basket-2001",
  "virtus certaldo": "virtus-certaldo",
  "cus firenze basket": "cus-firenze-basket",
  "cus firenze": "cus-firenze-basket",
  "don bosco livorno": "don-bosco-livorno",
  "dukes sansepolcro": "dukes-sansepolcro",
  "fides montevarchi": "fides-montevarchi",
  "folgore fucecchio": "folgore-fucecchio",
  "pallacanestro prato dragons": "pallacanestro-prato-dragons",
  "pallacanestro prato": "pallacanestro-prato-dragons",
  "basket sei rose rosignano": "basket-sei-rose-rosignano",
  "sei rose rosignano": "basket-sei-rose-rosignano",
  "sancat basket firenze": "sancat-basket-firenze",
  "basket san vincenzo": "basket-san-vincenzo",
  "union basket prato": "union-basket-prato",
  "us livorno basket": "us-livorno-basket",
  "basket livorno": "us-livorno-basket",
  "unione sportiva pino firenze": "unione-sportiva-pino-firenze",
  "valdisieve basket": "valdisieve-basket",
};

export function getTeamLogo(name: string): any {
  const id = TEAM_TO_ID[name.toLowerCase().trim()];
  return id ? TEAM_LOGOS[id] : undefined;
}
