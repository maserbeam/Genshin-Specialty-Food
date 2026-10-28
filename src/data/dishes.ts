import raw from "./dishes.json";

export type Ingredient = {
  name: string;
  count: number;
  icon: string;
};

export type Dish = {
  id: string;
  baseName: string;
  baseIcon: string;
  specialName: string;
  specialIcon: string;
  rarity: number;
  effectType: string;
  description: string;
  specialEffect: string;
  baseSummary: string;
  baseEffects: {
    suspicious: string;
    normal: string;
    delicious: string;
  };
  region: string;
  recipeSource: string;
  ingredients: Ingredient[];
  character: {
    name: string;
    element: string;
    nation: string;
    icon: string;
  };
  bonus: { talent: string; note: string } | null;
};

export const dishes = raw as Dish[];

export const EFFECT_TYPES = [
  "Healing",
  "Regeneration",
  "Revive",
  "ATK Up",
  "CRIT Rate Up",
  "DEF Up",
  "Stamina Increase",
  "Stamina Reduction",
] as const;

export const ELEMENTS = [
  "Pyro",
  "Hydro",
  "Anemo",
  "Electro",
  "Dendro",
  "Cryo",
  "Geo",
] as const;

export const REGIONS = [
  "Mondstadt",
  "Liyue",
  "Inazuma",
  "Sumeru",
  "Fontaine",
  "Natlan",
  "Nod-Krai",
  "Snezhnaya",
] as const;

export const COOK_CHANCE: Record<
  number,
  { suspicious: string; normal: string; delicious: string }
> = {
  1: { suspicious: "10%", normal: "15%", delicious: "20%" },
  2: { suspicious: "10%", normal: "10%", delicious: "15%" },
  3: { suspicious: "5%", normal: "10%", delicious: "15%" },
  4: { suspicious: "5%", normal: "5%", delicious: "10%" },
};

export function sourceLine(source: string) {
  const stripped = source.replace(/^The recipe for .+? is\s+/i, "");
  if (!stripped) return source;
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
