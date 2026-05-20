import { useEffect, useState } from "react";
import {
  DEFAULT_MATCHES,
  DEFAULT_PLAYERS,
  type Match,
  type Player,
  type RatingsMap,
} from "./barca-data";

const KEY = "barca-ratings-v1";

interface State {
  players: Player[];
  matches: Match[];
  ratings: RatingsMap;
}

const initial = (): State => ({
  players: DEFAULT_PLAYERS,
  matches: DEFAULT_MATCHES,
  ratings: {},
});

function load(): State {
  if (typeof window === "undefined") return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      players: parsed.players?.length ? parsed.players : DEFAULT_PLAYERS,
      matches: parsed.matches?.length ? parsed.matches : DEFAULT_MATCHES,
      ratings: parsed.ratings ?? {},
    };
  } catch {
    return initial();
  }
}

export function useBarcaStore() {
  const [state, setState] = useState<State>(() => initial());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const setRating = (matchId: string, playerId: string, patch: Partial<{ minutes: number; rating: number; note: string }>) => {
    setState((s) => {
      const key = `${matchId}::${playerId}`;
      const current = s.ratings[key] ?? {};
      const next = { ...current, ...patch };
      // strip empty
      const cleaned: typeof next = {};
      if (next.minutes !== undefined && !Number.isNaN(next.minutes)) cleaned.minutes = next.minutes;
      if (next.rating !== undefined && !Number.isNaN(next.rating)) cleaned.rating = next.rating;
      if (next.note) cleaned.note = next.note;
      const ratings = { ...s.ratings };
      if (Object.keys(cleaned).length === 0) delete ratings[key];
      else ratings[key] = cleaned;
      return { ...s, ratings };
    });
  };

  const updateMatch = (id: string, patch: Partial<Match>) => {
    setState((s) => ({ ...s, matches: s.matches.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  };

  const addMatch = (m: Match) => setState((s) => ({ ...s, matches: [...s.matches, m] }));
  const removeMatch = (id: string) =>
    setState((s) => {
      const ratings = { ...s.ratings };
      Object.keys(ratings).forEach((k) => { if (k.startsWith(`${id}::`)) delete ratings[k]; });
      return { ...s, matches: s.matches.filter((m) => m.id !== id), ratings };
    });

  const addPlayer = (p: Player) => setState((s) => ({ ...s, players: [...s.players, p] }));
  const removePlayer = (id: string) =>
    setState((s) => {
      const ratings = { ...s.ratings };
      Object.keys(ratings).forEach((k) => { if (k.endsWith(`::${id}`)) delete ratings[k]; });
      return { ...s, players: s.players.filter((p) => p.id !== id), ratings };
    });

  const resetAll = () => {
    localStorage.removeItem(KEY);
    setState(initial());
  };

  return { state, hydrated, setRating, updateMatch, addMatch, removeMatch, addPlayer, removePlayer, resetAll };
}
