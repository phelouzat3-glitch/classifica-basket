const ABC = "Abc Castelfiorentino"; // costante per evitare typo

type Match = {
  id: number;
  round: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  location: string;
  isMyTeam: boolean;
};

export const matches: Match[] = [
  // Giornate passate (homeScore non è null)
  {
    id: 1,
    round: 1,
    date: "2025-09-27",
    time: "18:00",
    homeTeam: ABC,
    awayTeam: "Don Bosco Livorno",
    homeScore: 79,
    awayScore: 61,
    location: "PalaBetti, Castelfiorentino",
    isMyTeam: true,
  },
  {
    id: 2,
    round: 2,
    date: "2025-10-05",
    time: "18:00",
    homeTeam: "Pallacanestro Agliana 2000",
    awayTeam: ABC,
    homeScore: 89,
    awayScore: 95,
    location: "Palazzetto Agliana",
    isMyTeam: true,
  },
  {
    id: 3,
    round: 3,
    date: "2025-10-22",
    time: "20:30",
    homeTeam: ABC,
    awayTeam: "Pallacanestro Prato Dragons",
    homeScore: 80,
    awayScore: 84,
    location: "PalaBetti, Castelfiorentino",
    isMyTeam: true,
  },
  {
    id: 4,
    round: 4,
    date: "2026-05-24",
    time: "18:00",
    homeTeam: "Etrusca San Miniato",
    awayTeam: "Abc Castelfiorentino",
    homeScore: null, // Pas encore joué
    awayScore: null, // Pas encore joué
    location: "PalaCarrara, San Miniato",
    isMyTeam: true,
  },
  {
    id: 5,
    round: 5,
    date: "2026-05-31",
    time: "17:30",
    homeTeam: "Abc Castelfiorentino",
    awayTeam: "Virtus Siena",
    homeScore: null,
    awayScore: null,
    location: "PalaBetti, Castelfiorentino",
    isMyTeam: true,
  },
  {
    id: 6,
    round: 6,
    date: "2026-06-07", // data futura
    time: "18:00",
    homeTeam: "Pallacanestro San Vincenzo", // squadra di San Vincenzo
    awayTeam: "Abc Castelfiorentino",
    homeScore: null,
    awayScore: null,
    location: "PalaSport, San Vincenzo",
    isMyTeam: true, // è la nostra squadra
  },

  {
    id: 7,
    round: 7,
    date: "2026-06-14", // data futura
    time: "18:00",
    homeTeam: ABC, // Abc Castelfiorentino
    awayTeam: "Pallacanestro Agliana 2000",
    homeScore: null,
    awayScore: null,
    location: "PalaBetti, Castelfiorentino",
    isMyTeam: true, // è la nostra squadra
  },
  {
    id: 8,
    round: 8,
    date: "2026-06-21", // data futura
    time: "18:00",
    homeTeam: "Pallacanestro Prato Dragons",
    awayTeam: ABC, // Abc Castelfiorentino
    homeScore: null,
    awayScore: null,
    location: "Palazzetto, Prato",
    isMyTeam: true, // è la nostra squadra
  },
  {
    id: 9,
    round: 9,
    date: "2026-06-28", // data futura
    time: "18:00",
    homeTeam: ABC, // Abc Castelfiorentino
    awayTeam: "Etrusca San Miniato",
    homeScore: null,
    awayScore: null,
    location: "PalaBetti, Castelfiorentino",
    isMyTeam: true, // è la nostra squadra
  },
  {
    id: 10,
    round: 10,
    date: "2026-07-05", // data futura
    time: "18:00",
    homeTeam: "Virtus Siena",
    awayTeam: ABC, // Abc Castelfiorentino
    homeScore: null,
    awayScore: null,
    location: "PalaEstra, Siena",
    isMyTeam: true, // è la nostra squadra
  },
];
