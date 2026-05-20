import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Plus, Trash2, RotateCcw, ShieldHalf, Star } from "lucide-react";
import { useBarcaStore } from "@/lib/store";
import { COMPETITIONS, type CompetitionId, type Match, type Player, type Position } from "@/lib/barca-data";
import { RatingBadge, ratingColor } from "@/components/RatingCell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Notas FC Barcelona · Temporada" },
      { name: "description", content: "Califica a los jugadores del Barça partido a partido en LaLiga, Copa, Supercopa y Champions." },
    ],
  }),
  component: Home,
});

const POS_LABEL: Record<Position, string> = { POR: "Porteros", DEF: "Defensas", MED: "Centrocampistas", DEL: "Delanteros" };
const POS_ORDER: Position[] = ["POR", "DEF", "MED", "DEL"];

function Home() {
  const store = useBarcaStore();
  const [tab, setTab] = useState<CompetitionId | "season">("laliga");

  if (!store.hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={store.resetAll} />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="season" className="font-display text-base">
              <Star className="mr-2 h-4 w-4" /> Temporada
            </TabsTrigger>
            {COMPETITIONS.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="font-display text-base">
                {c.short}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="season" className="mt-6">
            <SeasonView store={store} />
          </TabsContent>

          {COMPETITIONS.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-6">
              <CompetitionView competitionId={c.id} store={store} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="border-t mt-16 py-6 text-center text-sm text-muted-foreground">
        Tus notas se guardan automáticamente en este navegador · Força Barça
      </footer>
    </div>
  );
}

function Header({ onReset }: { onReset: () => void }) {
  return (
    <header className="bg-gradient-hero text-primary-foreground shadow-card">
      <div className="container mx-auto max-w-7xl px-4 py-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[color:var(--gold)] flex items-center justify-center shadow-glow">
            <ShieldHalf className="h-8 w-8 text-[color:var(--blaugrana)]" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl leading-none">Notas FC Barcelona</h1>
            <p className="text-sm md:text-base opacity-90 mt-1">
              Califica cada jugador, en cada partido, en cada competición
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Borrar todos los datos?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Esto eliminará todas las notas, minutos, partidos personalizados y jugadores añadidos.
            </p>
            <DialogFooter>
              <Button variant="destructive" onClick={onReset}>Sí, borrar todo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

/* ---------------- COMPETITION VIEW ---------------- */

function CompetitionView({ competitionId, store }: { competitionId: CompetitionId; store: ReturnType<typeof useBarcaStore> }) {
  const matches = store.state.matches.filter((m) => m.competition === competitionId);
  const [selectedId, setSelectedId] = useState<string>(matches[0]?.id ?? "");
  const selected = matches.find((m) => m.id === selectedId) ?? matches[0];

  const comp = COMPETITIONS.find((c) => c.id === competitionId)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Card className="shadow-card h-fit lg:sticky lg:top-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between font-display text-xl">
            <span className="flex items-center gap-2">
              <Trophy className="h-5 w-5" style={{ color: comp.color }} /> {comp.name}
            </span>
            <AddMatchDialog competitionId={competitionId} onAdd={store.addMatch} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 max-h-[70vh] overflow-y-auto">
          <ul className="space-y-1">
            {matches.map((m) => {
              const avg = matchAverage(m.id, store);
              return (
                <li key={m.id}>
                  <button
                    onClick={() => setSelectedId(m.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between gap-2 group",
                      selected?.id === m.id ? "bg-secondary" : "hover:bg-muted",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</div>
                      <div className="text-sm truncate font-medium">
                        {m.opponent || <span className="text-muted-foreground italic">Sin rival</span>}
                        {m.opponent && <span className="text-muted-foreground"> · {m.home ? "L" : "V"}</span>}
                      </div>
                    </div>
                    {avg !== null && (
                      <span className={cn("text-xs font-display px-2 py-0.5 rounded", ratingColor(avg))}>{avg.toFixed(1)}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div>
        {selected ? (
          <MatchEditor key={selected.id} match={selected} store={store} />
        ) : (
          <Card><CardContent className="p-12 text-center text-muted-foreground">Añade un partido para empezar</CardContent></Card>
        )}
      </div>
    </div>
  );
}

function AddMatchDialog({ competitionId, onAdd }: { competitionId: CompetitionId; onAdd: (m: Match) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [opponent, setOpponent] = useState("");
  const [home, setHome] = useState(true);

  const submit = () => {
    if (!label.trim()) return;
    onAdd({
      id: `${competitionId}-${Date.now()}`,
      competition: competitionId,
      label: label.trim(),
      opponent: opponent.trim(),
      home,
    });
    setLabel(""); setOpponent(""); setHome(true); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo partido</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Etiqueta</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Jornada 39 / Octavos vuelta" maxLength={60} />
          </div>
          <div>
            <Label>Rival</Label>
            <Input value={opponent} onChange={(e) => setOpponent(e.target.value)} placeholder="Ej: Real Madrid" maxLength={60} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={home} onCheckedChange={setHome} id="home" />
            <Label htmlFor="home">{home ? "Local (Camp Nou)" : "Visitante"}</Label>
          </div>
        </div>
        <DialogFooter><Button onClick={submit}>Añadir</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- MATCH EDITOR ---------------- */

function MatchEditor({ match, store }: { match: Match; store: ReturnType<typeof useBarcaStore> }) {
  const comp = COMPETITIONS.find((c) => c.id === match.competition)!;
  const grouped = POS_ORDER.map((pos) => ({
    pos,
    players: store.state.players.filter((p) => p.position === pos),
  }));

  const avg = matchAverage(match.id, store);

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-3 border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" style={{ borderColor: comp.color, color: comp.color }} className="font-semibold">
              {comp.short}
            </Badge>
            <span className="font-display text-lg text-muted-foreground">{match.label}</span>
          </div>
          {avg !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Media equipo:</span>
              <RatingBadge rating={avg} />
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Rival</Label>
            <Input
              value={match.opponent}
              onChange={(e) => store.updateMatch(match.id, { opponent: e.target.value })}
              placeholder="Ej: Rayo Vallecano"
              className="text-xl font-display h-12"
              maxLength={60}
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch
              checked={match.home}
              onCheckedChange={(v) => store.updateMatch(match.id, { home: v })}
              id={`home-${match.id}`}
            />
            <Label htmlFor={`home-${match.id}`} className="cursor-pointer">{match.home ? "Local" : "Visitante"}</Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 w-[40%]">Jugador</th>
                <th className="text-center px-2 py-3">Min</th>
                <th className="text-center px-2 py-3">Nota</th>
                <th className="text-left px-4 py-3">Gol/Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ pos, players }) => (
                <PositionRows
                  key={pos}
                  pos={pos}
                  players={players}
                  match={match}
                  store={store}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PositionRows({ pos, players, match, store }: { pos: Position; players: Player[]; match: Match; store: ReturnType<typeof useBarcaStore> }) {
  return (
    <>
      <tr>
        <td colSpan={4} className="bg-secondary/60 px-4 py-1.5 font-display text-sm uppercase tracking-wider text-secondary-foreground">
          {POS_LABEL[pos]}
        </td>
      </tr>
      {players.map((p) => {
        const key = `${match.id}::${p.id}`;
        const entry = store.state.ratings[key] ?? {};
        return (
          <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
            <td className="px-4 py-2">
              <div className="flex items-center gap-2">
                {p.number !== undefined && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-display">
                    {p.number}
                  </span>
                )}
                <span className="font-medium">{p.name}</span>
              </div>
            </td>
            <td className="px-2 py-2">
              <Input
                type="number"
                min={0}
                max={130}
                placeholder="—"
                value={entry.minutes ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  store.setRating(match.id, p.id, { minutes: v });
                }}
                className="h-9 w-20 mx-auto text-center tabular-nums"
              />
            </td>
            <td className="px-2 py-2">
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                placeholder="—"
                value={entry.rating ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  store.setRating(match.id, p.id, { rating: v });
                }}
                className={cn(
                  "h-9 w-20 mx-auto text-center tabular-nums font-display text-base",
                  entry.rating !== undefined && ratingColor(entry.rating),
                )}
              />
            </td>
            <td className="px-4 py-2">
              <Input
                placeholder="Goles, asistencias, detalles..."
                value={entry.note ?? ""}
                onChange={(e) => store.setRating(match.id, p.id, { note: e.target.value })}
                className="h-9"
                maxLength={200}
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}

/* ---------------- SEASON VIEW ---------------- */

function SeasonView({ store }: { store: ReturnType<typeof useBarcaStore> }) {
  const [filter, setFilter] = useState<CompetitionId | "all">("all");
  const [sortBy, setSortBy] = useState<"rating" | "minutes" | "matches" | "name">("rating");

  const rows = useMemo(() => {
    return store.state.players.map((p) => {
      let total = 0, count = 0, minutes = 0;
      let best = -Infinity, worst = Infinity;
      const perComp: Record<CompetitionId, { sum: number; n: number }> = {
        laliga: { sum: 0, n: 0 }, copa: { sum: 0, n: 0 }, supercopa: { sum: 0, n: 0 }, champions: { sum: 0, n: 0 },
      };
      store.state.matches.forEach((m) => {
        if (filter !== "all" && m.competition !== filter) return;
        const e = store.state.ratings[`${m.id}::${p.id}`];
        if (!e) return;
        if (e.minutes) minutes += e.minutes;
        if (e.rating !== undefined && !Number.isNaN(e.rating)) {
          total += e.rating; count += 1;
          if (e.rating > best) best = e.rating;
          if (e.rating < worst) worst = e.rating;
          perComp[m.competition].sum += e.rating;
          perComp[m.competition].n += 1;
        }
      });
      return {
        player: p,
        avg: count ? total / count : null,
        matches: count,
        minutes,
        best: count ? best : null,
        worst: count ? worst : null,
        perComp,
      };
    });
  }, [store.state, filter]);

  const sorted = [...rows].sort((a, b) => {
    if (sortBy === "name") return a.player.name.localeCompare(b.player.name);
    if (sortBy === "matches") return b.matches - a.matches;
    if (sortBy === "minutes") return b.minutes - a.minutes;
    const av = a.avg ?? -1, bv = b.avg ?? -1;
    return bv - av;
  });

  const topThree = [...rows].filter((r) => r.avg !== null && r.matches >= 1).sort((a, b) => (b.avg! - a.avg!)).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top 3 */}
      {topThree.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {topThree.map((r, i) => (
            <Card key={r.player.id} className={cn("shadow-card overflow-hidden", i === 0 && "ring-2 ring-[color:var(--gold)]")}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="font-display" variant={i === 0 ? "default" : "secondary"}>
                    {i === 0 ? "MVP" : `Top ${i + 1}`}
                  </Badge>
                  <Trophy className={cn("h-5 w-5", i === 0 ? "text-[color:var(--gold)]" : "text-muted-foreground")} />
                </div>
                <div className="font-display text-2xl mb-1">{r.player.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{POS_LABEL[r.player.position]} · {r.matches} partidos</div>
                <RatingBadge rating={r.avg ?? undefined} className="h-12 w-20 text-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="shadow-card">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <CardTitle className="font-display text-xl">Resumen de la temporada</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas competiciones</SelectItem>
                  {COMPETITIONS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Mejor nota</SelectItem>
                  <SelectItem value="matches">Más partidos</SelectItem>
                  <SelectItem value="minutes">Más minutos</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Jugador</th>
                  <th className="text-center px-3 py-3">Pos</th>
                  <th className="text-center px-3 py-3">PJ</th>
                  <th className="text-center px-3 py-3">Min</th>
                  <th className="text-center px-3 py-3">Liga</th>
                  <th className="text-center px-3 py-3">Copa</th>
                  <th className="text-center px-3 py-3">SCpa</th>
                  <th className="text-center px-3 py-3">UCL</th>
                  <th className="text-center px-3 py-3">Peor</th>
                  <th className="text-center px-3 py-3">Mejor</th>
                  <th className="text-center px-3 py-3">Media</th>
                  <th className="text-center px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.player.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">
                      <span className="inline-flex items-center gap-2">
                        {r.player.number !== undefined && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-display">{r.player.number}</span>
                        )}
                        {r.player.name}
                      </span>
                    </td>
                    <td className="text-center px-3 py-2 text-xs text-muted-foreground">{r.player.position}</td>
                    <td className="text-center px-3 py-2 tabular-nums">{r.matches || "—"}</td>
                    <td className="text-center px-3 py-2 tabular-nums">{r.minutes || "—"}</td>
                    <td className="text-center px-3 py-2 tabular-nums">{compAvg(r.perComp.laliga)}</td>
                    <td className="text-center px-3 py-2 tabular-nums">{compAvg(r.perComp.copa)}</td>
                    <td className="text-center px-3 py-2 tabular-nums">{compAvg(r.perComp.supercopa)}</td>
                    <td className="text-center px-3 py-2 tabular-nums">{compAvg(r.perComp.champions)}</td>
                    <td className="text-center px-3 py-2 tabular-nums text-muted-foreground">{r.worst !== null ? r.worst.toFixed(1) : "—"}</td>
                    <td className="text-center px-3 py-2 tabular-nums text-muted-foreground">{r.best !== null ? r.best.toFixed(1) : "—"}</td>
                    <td className="text-center px-3 py-2"><RatingBadge rating={r.avg ?? undefined} /></td>
                    <td className="text-center px-3 py-2">
                      <button
                        onClick={() => store.removePlayer(r.player.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Eliminar ${r.player.name}`}
                        title="Quitar jugador"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PlayerManager store={store} />
    </div>
  );
}

function compAvg(c: { sum: number; n: number }) {
  return c.n ? (c.sum / c.n).toFixed(1) : "—";
}

function matchAverage(matchId: string, store: ReturnType<typeof useBarcaStore>): number | null {
  let sum = 0, n = 0;
  store.state.players.forEach((p) => {
    const e = store.state.ratings[`${matchId}::${p.id}`];
    if (e?.rating !== undefined && !Number.isNaN(e.rating)) { sum += e.rating; n += 1; }
  });
  return n ? sum / n : null;
}

/* ---------------- PLAYER MANAGER ---------------- */

function PlayerManager({ store }: { store: ReturnType<typeof useBarcaStore> }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("MED");
  const [number, setNumber] = useState("");

  const add = () => {
    if (!name.trim()) return;
    store.addPlayer({
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
      name: name.trim(),
      position,
      number: number ? Number(number) : undefined,
    });
    setName(""); setNumber("");
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-xl">Plantilla</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-[1fr_140px_100px_auto] gap-2 mb-4">
          <Input placeholder="Nombre del jugador" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POS_ORDER.map((p) => <SelectItem key={p} value={p}>{POS_LABEL[p]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Nº" value={number} onChange={(e) => setNumber(e.target.value)} min={1} max={99} />
          <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Añadir</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {store.state.players.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
              {p.number !== undefined && <span className="text-xs font-display opacity-70">#{p.number}</span>}
              {p.name}
              <span className="text-[10px] uppercase opacity-60">{p.position}</span>
              <button
                onClick={() => store.removePlayer(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Eliminar ${p.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
