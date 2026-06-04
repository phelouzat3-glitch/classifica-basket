import logoAbc from "@/assets/images/teams/abc-castelfiorentino.png";
import logoAgliana from "@/assets/images/teams/pallacanestro-agliana-2000.png";
import logoBottegone from "@/assets/images/teams/bottegone-basket-2001.png";
import logoCertaldo from "@/assets/images/teams/virtus-certaldo.png";
import logoCusFirenze from "@/assets/images/teams/cus-firenze-basket.png";
import logoDonBosco from "@/assets/images/teams/don-bosco-livorno.png";
import logoDukes from "@/assets/images/teams/dukes-sansepolcro.png";
import logoFides from "@/assets/images/teams/fides-montevarchi.png";
import logoFolgore from "@/assets/images/teams/folgore-fucecchio.png";
import logoPratoDragons from "@/assets/images/teams/pallacanestro-prato-dragons.png";
import logoRosignano from "@/assets/images/teams/basket-sei-rose-rosignano.png";
import logoSancat from "@/assets/images/teams/sancat-basket-firenze.png";
import logoSanVincenzo from "@/assets/images/teams/basket-san-vincenzo.png";
import logoUnionPrato from "@/assets/images/teams/union-basket-prato.png";
import logoUSLivorno from "@/assets/images/teams/us-livorno-basket.png";
import logoUSPino from "@/assets/images/teams/unione-sportiva-pino-firenze.png";
import logoValdisieve from "@/assets/images/teams/valdisieve-basket.png";

const LOGO_BY_ID: Record<string, any> = {
  "abc-castelfiorentino": logoAbc,
  "pallacanestro-agliana-2000": logoAgliana,
  "bottegone-basket-2001": logoBottegone,
  "virtus-certaldo": logoCertaldo,
  "cus-firenze-basket": logoCusFirenze,
  "don-bosco-livorno": logoDonBosco,
  "dukes-sansepolcro": logoDukes,
  "fides-montevarchi": logoFides,
  "folgore-fucecchio": logoFolgore,
  "pallacanestro-prato-dragons": logoPratoDragons,
  "basket-sei-rose-rosignano": logoRosignano,
  "sancat-basket-firenze": logoSancat,
  "basket-san-vincenzo": logoSanVincenzo,
  "union-basket-prato": logoUnionPrato,
  "us-livorno-basket": logoUSLivorno,
  "unione-sportiva-pino-firenze": logoUSPino,
  "valdisieve-basket": logoValdisieve,
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
  return id ? LOGO_BY_ID[id] : undefined;
}
