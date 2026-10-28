import { useEffect, useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import { EFFECT_TYPES, REGIONS, dishes, sourceLine, type Dish } from "@/data/dishes";

const MARK_KEY = "special-dishes:marked";

type SortKey = "dish" | "character" | "special" | "rarity" | "effect";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function asset(path: string) {
  if (!path.startsWith("/")) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}

function toggleMember<T>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function SpecialtyBoard() {
  const [query, setQuery] = useState("");
  const [effects, setEffects] = useState<Set<string>>(new Set());
  const [stars, setStars] = useState<Set<number>>(new Set());
  const [region, setRegion] = useState("");
  const [sort, setSort] = useState<SortKey>("dish");
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [markedOnly, setMarkedOnly] = useState(false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedMarks = localStorage.getItem(MARK_KEY);
      if (storedMarks) {
        const names = JSON.parse(storedMarks) as string[];
        if (Array.isArray(names)) setMarked(new Set(names));
      }
    } catch {
      /* ignore private-mode storage failures */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(MARK_KEY, JSON.stringify([...marked]));
  }, [marked, ready]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = dishes.filter((dish) => {
      if (effects.size && !effects.has(dish.effectType)) return false;
      if (stars.size && !stars.has(dish.rarity)) return false;
      if (region && dish.region !== region) return false;
      if (markedOnly && !marked.has(dish.character.name)) return false;
      if (!q) return true;
      const hay = [
        dish.baseName,
        dish.specialName,
        dish.character.name,
        dish.effectType,
        dish.region,
        dish.specialEffect,
        dish.baseSummary,
        dish.recipeSource,
        ...dish.ingredients.map((item) => item.name),
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
    list.sort((a, b) => {
      if (sort === "character") return a.character.name.localeCompare(b.character.name);
      if (sort === "special") return a.specialName.localeCompare(b.specialName);
      if (sort === "rarity") return b.rarity - a.rarity || a.baseName.localeCompare(b.baseName);
      if (sort === "effect") return a.effectType.localeCompare(b.effectType) || a.baseName.localeCompare(b.baseName);
      return a.baseName.localeCompare(b.baseName);
    });
    return list;
  }, [effects, marked, markedOnly, query, region, sort, stars]);

  const filtersOn = query.trim() !== "" || effects.size > 0 || stars.size > 0 || region !== "" || markedOnly;

  function clearFilters() {
    setQuery("");
    setEffects(new Set());
    setStars(new Set());
    setRegion("");
    setMarkedOnly(false);
  }

  return (
    <div className="min-h-screen">
      <header className="topbar">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 pt-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="page-title font-display text-gold">Specialty Dishes</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base text-faint">
              {filtered.length} / {dishes.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <label className="relative min-w-0 flex-1 basis-64">
            <span className="sr-only">Search dishes, characters, or ingredients</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <input
              className="field w-full pr-10 pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Dish, character, ingredient…"
              type="search"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center text-muted"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
          <label className="sr-only" htmlFor="sort">
            Sort
          </label>
          <select id="sort" className="select" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="dish">Sort: base dish</option>
            <option value="special">Sort: specialty</option>
            <option value="character">Sort: character</option>
            <option value="rarity">Sort: stars</option>
            <option value="effect">Sort: effect</option>
          </select>
          <label className="sr-only" htmlFor="region">
            Cuisine
          </label>
          <select id="region" className="select" value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value="">All cuisines</option>
            {REGIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="chip-row">
          {EFFECT_TYPES.map((name) => (
            <button
              key={name}
              type="button"
              className={cx("chip text-base", effects.has(name) && "chip-on")}
              aria-pressed={effects.has(name)}
              onClick={() => setEffects((current) => toggleMember(current, name))}
            >
              {name}
            </button>
          ))}
          {[1, 2, 3, 4].map((rarity) => (
            <button
              key={rarity}
              type="button"
              className={cx("chip text-base", stars.has(rarity) && "chip-on")}
              aria-pressed={stars.has(rarity)}
              onClick={() => setStars((current) => toggleMember(current, rarity))}
            >
              {rarity}★
            </button>
          ))}
          <button
            type="button"
            className={cx("chip text-base", markedOnly && "chip-on")}
            aria-pressed={markedOnly}
            onClick={() => setMarkedOnly((on) => !on)}
          >
            Marked{marked.size ? ` (${marked.size})` : ""}
          </button>
          {filtersOn && (
            <button type="button" className="chip text-base" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
        <p className="mark-note">Tap a food icon to mark a recipe. Marked dishes keep a gold outline.</p>
      </header>

      {filtered.length === 0 ? (
        <div className="px-3 py-16 text-center">
          <p className="page-title font-display text-gold">Nothing on the board</p>
          <p className="mt-2 text-base text-muted">
            {markedOnly && marked.size === 0
              ? "Tap a food icon to mark a recipe, or turn off the Marked filter."
              : "Try another ingredient, character, or effect."}
          </p>
        </div>
      ) : (
        <ul className="board board-plates">
          {filtered.map((dish) => (
            <li key={dish.id}>
              <DishCard
                dish={dish}
                marked={marked.has(dish.character.name)}
                onToggleMark={() => setMarked((current) => toggleMember(current, dish.character.name))}
              />
            </li>
          ))}
        </ul>
      )}

      <footer className="px-3 pt-2 pb-8 text-base text-faint">
        Personal reference from the Genshin Impact Wiki special-dish list. Not affiliated with HoYoverse.
      </footer>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="stars" aria-label={`${count} star`}>
      {Array.from({ length: count }, (_, index) => (
        <Star key={index} className="size-3.5 fill-gold text-gold" aria-hidden />
      ))}
    </span>
  );
}

function DishCard({
  dish,
  marked,
  onToggleMark,
}: {
  dish: Dish;
  marked: boolean;
  onToggleMark: () => void;
}) {
  const [open, setOpen] = useState(false);

  const titles = (
    <div className="dish-head min-w-0">
      <h2 className="dish-title font-display text-fg">
        <span className="region-tag mb-0.5 block">{dish.region}</span>
        {dish.baseName}
      </h2>
    </div>
  );

  const character = (
    <div className="char-line">
      <span className="portrait">
        <img src={asset(dish.character.icon)} alt="" width={128} height={128} />
      </span>
      <p className="min-w-0 text-base leading-snug">
        <span className="font-medium text-fg">{dish.character.name}</span>
        <span className="text-gold">
          {" · "}
          <img className="char-special" src={asset(dish.specialIcon)} alt="" width={64} height={64} />
          {dish.specialName}
        </span>
      </p>
    </div>
  );

  const tags = (
    <p className="recipe-tags text-sm text-muted">
      {dish.character.nation ? `${dish.character.nation} · ` : ""}
      {dish.effectType}
    </p>
  );

  const effects = (
    <div className="plate-copy">
      <p className="text-base leading-relaxed text-fg">
        <span className="font-medium text-gold">Specialty. </span>
        {dish.specialEffect}
      </p>
      <p className="mt-1 text-base leading-relaxed text-muted">
        <span className="text-faint">Usual. </span>
        {dish.baseSummary}
      </p>
      {dish.bonus && (
        <p className="mt-1 text-base text-gold">
          {dish.bonus.talent}: {dish.bonus.note}
        </p>
      )}
      <button type="button" className="mt-1 text-base text-muted underline underline-offset-2" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? "Hide breakdown" : "Quality breakdown"}
      </button>
      {open && (
        <div className="mt-2 space-y-1 text-base leading-relaxed text-muted">
          <p>Suspicious · {dish.baseEffects.suspicious}</p>
          <p>Normal · {dish.baseEffects.normal}</p>
          <p>Delicious · {dish.baseEffects.delicious}</p>
          <p className="text-fg">Specialty · {dish.specialEffect}</p>
          {dish.description && <p className="text-fg">{dish.description}</p>}
        </div>
      )}
      {dish.recipeSource && <p className="source-note mt-2 text-sm leading-relaxed text-faint">{sourceLine(dish.recipeSource)}</p>}
    </div>
  );

  const ingredients = (
    <div className="ing-grid" aria-label="Ingredients">
      {dish.ingredients.map((item) => (
        <div key={item.name} className="ing">
          <div className="ing-slot">
            <img src={asset(item.icon)} alt="" width={128} height={128} />
            <span className="qty text-sm">{item.count}</span>
          </div>
          <span className="ing-name text-base text-fg">
            {item.name}
            <span className="sr-only">, {item.count}</span>
          </span>
        </div>
      ))}
    </div>
  );

  const food = (
    <button
      type="button"
      className={cx("food-slot", `rarity-${dish.rarity}`, marked && "food-slot-on")}
      aria-pressed={marked}
      aria-label={`${marked ? "Unmark" : "Mark"} ${dish.baseName}`}
      onClick={onToggleMark}
    >
      <img src={asset(dish.baseIcon)} alt="" width={256} height={256} />
      <Stars count={dish.rarity} />
    </button>
  );

  return (
    <article className="card card-plate">
      <div className="plate-top">
        {ingredients}
        {food}
        {titles}
      </div>
      {character}
      {effects}
      {tags}
    </article>
  );
}
