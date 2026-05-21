export type Position = "POR" | "DEF" | "MED" | "DEL";

export interface Player {
  id: string;
  name: string;
  position: Position;
  number?: number;
}

export const DEFAULT_PLAYERS: Player[] = [
  // Porteros
  { id: "ter-stegen", name: "Ter Stegen", position: "POR", number: 1 },
  { id: "szczesny", name: "Szczęsny", position: "POR", number: 25 },
  { id: "inaki-pena", name: "Iñaki Peña", position: "POR", number: 13 },
  // Defensas
  { id: "kounde", name: "Koundé", position: "DEF", number: 23 },
  { id: "cubarsi", name: "Cubarsí", position: "DEF", number: 2 },
  { id: "araujo", name: "Araújo", position: "DEF", number: 4 },
  { id: "inigo-martinez", name: "Iñigo Martínez", position: "DEF", number: 5 },
  { id: "christensen", name: "Christensen", position: "DEF", number: 15 },
  { id: "eric-garcia", name: "Eric García", position: "DEF", number: 24 },
  { id: "balde", name: "Balde", position: "DEF", number: 3 },
  { id: "gerard-martin", name: "Gerard Martín", position: "DEF", number: 35 },
  { id: "hector-fort", name: "Héctor Fort", position: "DEF", number: 32 },
  // Medios
  { id: "de-jong", name: "Frenkie de Jong", position: "MED", number: 21 },
  { id: "pedri", name: "Pedri", position: "MED", number: 8 },
  { id: "gavi", name: "Gavi", position: "MED", number: 6 },
  { id: "casado", name: "Marc Casadó", position: "MED", number: 17 },
  { id: "fermin", name: "Fermín López", position: "MED", number: 16 },
  { id: "dani-olmo", name: "Dani Olmo", position: "MED", number: 20 },
  { id: "bernal", name: "Marc Bernal", position: "MED", number: 22 },
  // Delanteros
  { id: "lewandowski", name: "Lewandowski", position: "DEL", number: 9 },
  { id: "yamal", name: "Lamine Yamal", position: "DEL", number: 19 },
  { id: "raphinha", name: "Raphinha", position: "DEL", number: 11 },
  { id: "ferran", name: "Ferran Torres", position: "DEL", number: 7 },
  { id: "pau-victor", name: "Pau Víctor", position: "DEL", number: 14 },
  { id: "ansu-fati", name: "Ansu Fati", position: "DEL", number: 10 },
];

export type CompetitionId = "laliga" | "copa" | "supercopa" | "champions";

export interface Competition {
  id: CompetitionId;
  name: string;
  short: string;
  color: string;
}

export const COMPETITIONS: Competition[] = [
  { id: "laliga", name: "LaLiga", short: "Liga", color: "oklch(0.55 0.20 18)" },
  { id: "copa", name: "Copa del Rey", short: "Copa", color: "oklch(0.45 0.18 280)" },
  { id: "supercopa", name: "Supercopa de España", short: "Supercopa", color: "oklch(0.75 0.15 85)" },
  { id: "champions", name: "UEFA Champions League", short: "Champions", color: "oklch(0.35 0.15 250)" },
];

export interface Match {
  id: string;
  competition: CompetitionId;
  label: string;     // e.g. "Jornada 1"
  opponent: string;  // e.g. "Rayo Vallecano"
  home: boolean;
  date?: string;
}

const seedLaliga = (): Match[] =>
  Array.from({ length: 38 }, (_, i) => ({
    id: `laliga-j${i + 1}`,
    competition: "laliga" as const,
    label: `Jornada ${i + 1}`,
    opponent: "",
    home: i % 2 === 0,
  }));

const seedChampions = (): Match[] =>
  Array.from({ length: 8 }, (_, i) => ({
    id: `ucl-l${i + 1}`,
    competition: "champions" as const,
    label: `Fase Liga · J${i + 1}`,
    opponent: "",
    home: i % 2 === 0,
  }));

const seedSupercopa = (): Match[] => [
  { id: "sc-sf", competition: "supercopa", label: "Semifinal", opponent: "", home: false },
  { id: "sc-f", competition: "supercopa", label: "Final", opponent: "", home: false },
];

const seedCopa = (): Match[] => [
  { id: "copa-r1", competition: "copa", label: "1/16 Final", opponent: "", home: false },
  { id: "copa-r2", competition: "copa", label: "Octavos", opponent: "", home: false },
  { id: "copa-r3", competition: "copa", label: "Cuartos", opponent: "", home: false },
  { id: "copa-sf", competition: "copa", label: "Semifinal", opponent: "", home: false },
  { id: "copa-f", competition: "copa", label: "Final", opponent: "", home: false },
];

export const DEFAULT_MATCHES: Match[] = [
  ...seedLaliga(),
  ...seedCopa(),
  ...seedSupercopa(),
  ...seedChampions(),
];

// Ratings keyed by `${matchId}::${playerId}` -> { minutes, rating, note }
export interface RatingEntry {
  minutes?: number;
  rating?: number;
  note?: string;
  starred?: boolean;
}
export type RatingsMap = Record<string, RatingEntry>;
