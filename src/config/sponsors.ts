export type Sponsor = {
  id: string;
  name: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
};

export const SPONSORS: Sponsor[] = [
  {
    id: "bar-sport",
    name: "Bar Sport",
    imageUrl: undefined,
    linkUrl: undefined,
    isActive: true,
  },
];

export function getActiveSponsors(): Sponsor[] {
  return SPONSORS.filter((s) => s.isActive);
}
