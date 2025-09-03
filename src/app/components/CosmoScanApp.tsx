"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";

/**
 * CosmoScan — Single‑file React app (UI v2)
 *
 * Alterações visuais
 * - Estilo mais arredondado (rounded-3xl) e sombras suaves
 * - Paleta em roxo/rosa (violet/pink)
 * - Realce com gradientes rosas/roxos e foco acessível
 */

export default function CosmoScanApp() {
  // ====== Dados mockados (exemplo) ======
  const [products] = useState<Product[]>(() => MOCK_PRODUCTS);

  // ====== Estado de busca/filtros ======
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("todas");
  const [minRating, setMinRating] = useState<number>(0);
  const [focusId, setFocusId] = useState<string | null>(null); // produto selecionado

  // Debounce simples da query
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const categories = useMemo(() => {
    const base = new Set(products.map((p) => p.category));
    return ["todas", ...Array.from(base)];
  }, [products]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const cat = category.toLowerCase();

    let list = products.filter((p) => {
      const matchesText =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.inci.some((ing) => ing.name.toLowerCase().includes(q));

      const matchesCat = cat === "todas" || p.category.toLowerCase() === cat;
      const matchesRating = averageRating(p.reviews) >= minRating;
      return matchesText && matchesCat && matchesRating;
    });

    list.sort((a, b) => averageRating(b.reviews) - averageRating(a.reviews));
    return list;
  }, [products, debouncedQuery, category, minRating]);

  const focusedProduct = useMemo(
    () => products.find((p) => p.id === focusId) ?? null,
    [focusId, products]
  );

  const closeModal = useCallback(() => setFocusId(null), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-pink-200/70">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-tight text-violet-700">CosmoScan</h1>
              <p className="text-xs text-violet-500">
                Pesquisa e análise de cosméticos • INCI • uso • pele • avaliações
              </p>
            </div>
          </div>
          <span className="text-xs text-pink-500">Demo</span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Barra de busca e filtros */}
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          minRating={minRating}
          onMinRatingChange={setMinRating}
        />

        {/* Resultados */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-violet-700">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </h2>
          </div>
          {filtered.length === 0 ? (
            <EmptyState query={debouncedQuery} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => setFocusId(p.id)} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de detalhes */}
      {focusedProduct && (
        <ProductModal product={focusedProduct} onClose={closeModal} />
      )}

      {/* Rodapé */}
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-violet-600/80">
        <p>Conteúdo de ingredientes e avaliações é ilustrativo (mock). Substitua por sua API/BD.</p>
      </footer>
    </div>
  );
}

// ===================== Componentes ===================== //

function Logo() {
  return (
    <div className="w-10 h-10 rounded-3xl bg-gradient-to-tr from-pink-500 to-violet-600 grid place-items-center shadow-md ring-1 ring-pink-300/40">
      <span className="text-white font-bold">CS</span>
    </div>
  );
}

function SearchBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
  minRating,
  onMinRatingChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
  minRating: number;
  onMinRatingChange: (v: number) => void;
}) {
  return (
    <section className="rounded-3xl bg-white/90 border border-pink-200 shadow-sm p-4 ring-1 ring-pink-100">
      <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-violet-700 mb-1">
            Buscar por nome, marca, categoria ou ingrediente (INCI)
          </label>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              type="text"
              placeholder="Ex.: protetor solar, ácido hialurônico, La Vitta..."
              className="w-full rounded-2xl border border-violet-200 px-3 py-2 pr-10 outline-none focus:ring-4 focus:ring-pink-200/70 focus:border-pink-400 bg-white/80"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400">⌕</span>
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-violet-700 mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-2xl border border-violet-200 px-3 py-2 outline-none focus:ring-4 focus:ring-pink-200/70 focus:border-pink-400 bg-white/80"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {capitalize(c)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-violet-700 mb-1">Nota mínima</label>
          <select
            value={String(minRating)}
            onChange={(e) => onMinRatingChange(Number(e.target.value))}
            className="w-full rounded-2xl border border-violet-200 px-3 py-2 outline-none focus:ring-4 focus:ring-pink-200/70 focus:border-pink-400 bg-white/80"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Todas" : `${n}+ estrelas`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const avg = averageRating(product.reviews);
  return (
    <button
      onClick={onClick}
      className="text-left rounded-3xl bg-white/90 border border-violet-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-pink-200/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-tight text-violet-800">{product.name}</h3>
          <p className="text-sm text-violet-600">{product.brand}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
          {capitalize(product.category)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <Rating value={avg} />
        <span className="text-violet-500">({product.reviews.length})</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {product.skinTypes.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>

      <div className="mt-3 text-xs text-violet-700/90 line-clamp-2">
        {product.usage}
      </div>
    </button>
  );
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const avg = averageRating(product.reviews);

  return (
    <div className="fixed inset-0 z-20">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="md:max-w-3xl w-full md:rounded-3xl bg-white border border-violet-200 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold leading-tight text-violet-800">{product.name}</h3>
                <p className="text-sm text-violet-600">{product.brand}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Rating value={avg} />
                  <span className="text-violet-600">{avg.toFixed(1)} / 5 • {product.reviews.length} avaliação{product.reviews.length !== 1 ? "s" : ""}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                    {capitalize(product.category)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-2xl border border-violet-200 px-3 py-2 text-sm hover:bg-violet-50 text-violet-700"
                aria-label="Fechar detalhes"
              >
                Fechar ✕
              </button>
            </div>

            {/* Seções */}
            <div className="mt-6 grid gap-6">
              {/* INCI */}
              <section>
                <h4 className="font-medium mb-2 text-violet-800">Ingredientes (INCI)</h4>
                <div className="rounded-2xl overflow-hidden border border-violet-200">
                  <table className="w-full text-sm">
                    <thead className="bg-violet-50 text-violet-700">
                      <tr>
                        <th className="text-left py-2 px-3 w-1/4">Ingrediente</th>
                        <th className="text-left py-2 px-3">Função</th>
                        <th className="text-left py-2 px-3">Ativo</th>
                        <th className="text-left py-2 px-3">Alertas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.inci.map((ing, idx) => (
                        <tr key={idx} className="border-t border-violet-200">
                          <td className="py-2 px-3 font-medium text-violet-900">{ing.name}</td>
                          <td className="py-2 px-3 text-violet-800">{roleLabel(ing.role)}</td>
                          <td className="py-2 px-3">
                            {ing.active ? <Badge label="Ativo" tone="violet" /> : <span className="text-neutral-400">—</span>}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-2">
                              {ing.allergenic && <Badge label="Alergênico potencial" tone="pink" />}
                              {ing.controversial && ing.controversial.length > 0 && (
                                <Badge label={`Controverso: ${ing.controversial.join(", ")}`} tone="rose" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Uso & Pele */}
              <section className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-violet-200 p-4 bg-white/80">
                  <h4 className="font-medium mb-2 text-violet-800">Modo de uso</h4>
                  <p className="text-sm text-violet-800/90 whitespace-pre-line">{product.usage}</p>
                </div>
                <div className="rounded-2xl border border-violet-200 p-4 bg-white/80">
                  <h4 className="font-medium mb-2 text-violet-800">Tipos de pele recomendados</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.skinTypes.map((t) => (
                      <Tag key={t} label={t} />
                    ))}
                  </div>
                </div>
              </section>

              {/* Avaliações */}
              <section>
                <h4 className="font-medium mb-2 text-violet-800">Avaliações</h4>
                {product.reviews.length === 0 ? (
                  <p className="text-sm text-violet-700/80">Ainda não há avaliações.</p>
                ) : (
                  <ul className="grid gap-3">
                    {product.reviews.map((r, i) => (
                      <li key={i} className="rounded-2xl border border-violet-200 p-3 bg-white/90">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-violet-900">{r.user}</span>
                          <Rating value={r.rating} compact />
                        </div>
                        <p className="text-sm text-violet-800/90">{r.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rating({ value, compact = false }: { value: number; compact?: boolean }) {
  const filled = Math.round(value);
  return (
    <div className="inline-flex items-center gap-1 text-purple-600">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden className={i < filled ? "opacity-100" : "opacity-30"}>
          ★
        </span>
      ))}
      {!compact && <span className="text-sm text-violet-700">{value.toFixed(1)}</span>}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full border border-pink-200 bg-pink-50 text-pink-700">
      {capitalize(label)}
    </span>
  );
}

function Badge({ label, tone = "violet" }: { label: string; tone?: "violet" | "pink" | "rose" | "amber" | "gray" }) {
  const map: Record<string, string> = {
    violet: "bg-violet-50 text-violet-800 border-violet-200",
    pink: "bg-pink-50 text-pink-800 border-pink-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    amber: "bg-amber-50 text-amber-900 border-amber-200",
    gray: "bg-neutral-100 text-neutral-800 border-neutral-200",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${map[tone]}`}>{label}</span>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-violet-300 p-10 text-center bg-white/90">
      <p className="text-sm text-violet-800">
        {query ? (
          <>Não encontramos resultados para "<strong>{query}</strong>".</>
        ) : (
          <>Use a busca acima para encontrar um cosmético.</>
        )}
      </p>
      <div className="mt-3 text-xs text-violet-600">
        Sugestões: "hidratante", "ácido hialurônico", "protetor solar".
      </div>
    </div>
  );
}

// ===================== Tipos & Utilitários ===================== //

type IngredientRole =
  | "moisturizer"
  | "antioxidant"
  | "preservative"
  | "sunscreen"
  | "fragrance"
  | "humectant"
  | "emollient"
  | "surfactant"
  | "exfoliant";

type Ingredient = {
  name: string;
  role: IngredientRole;
  active?: boolean;
  allergenic?: boolean;
  controversial?: string[];
};

type Review = {
  user: string;
  rating: number;
  comment: string;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  inci: Ingredient[];
  usage: string;
  skinTypes: string[];
  reviews: Review[];
};

function averageRating(reviews: Review[]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

function roleLabel(role: IngredientRole) {
  const map: Partial<Record<IngredientRole, string>> = {
    moisturizer: "Hidratante",
    antioxidant: "Antioxidante",
    preservative: "Conservante",
    sunscreen: "Filtro solar",
    fragrance: "Fragrância",
    humectant: "Umectante",
    emollient: "Emoliente",
    surfactant: "Tensoativo",
    exfoliant: "Esfoliante",
  };
  return (map[role] as string) ?? role;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===================== Mock DB ===================== //

const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Derma Glow Hidratante Facial",
    brand: "CosmoLab",
    category: "hidratante",
    inci: [
      { name: "Aqua", role: "solvent" as any },
      { name: "Glycerin", role: "humectant", active: true },
      { name: "Sodium Hyaluronate (Hyaluronic Acid)", role: "humectant", active: true },
      { name: "Caprylic/Capric Triglyceride", role: "emollient" },
      { name: "Phenoxyethanol", role: "preservative", controversial: ["conservante sintético"] },
      { name: "Parfum (Fragrance)", role: "fragrance", allergenic: true },
    ],
    usage:
      "Aplicar de 1 a 2 pumps sobre a pele limpa, de manhã e à noite.\nReaplicar em áreas ressecadas quando necessário.",
    skinTypes: ["seca", "mista", "sensível"],
    reviews: [
      { user: "Ana P.", rating: 5, comment: "Deixou minha pele macia sem pesar." },
      { user: "Larissa", rating: 4, comment: "Hidrata bem, cheiro suave." },
    ],
  },
  {
    id: "p2",
    name: "UV Defense Pro SPF 50",
    brand: "Solaris",
    category: "protetor solar",
    inci: [
      { name: "Aqua", role: "solvent" as any },
      { name: "Homosalate", role: "sunscreen", active: true, controversial: ["filtro químico"] },
      { name: "Octocrylene", role: "sunscreen", active: true, controversial: ["filtro químico"] },
      { name: "Butyl Methoxydibenzoylmethane (Avobenzone)", role: "sunscreen", active: true },
      { name: "Silica", role: "emollient" },
      { name: "Phenoxyethanol", role: "preservative" },
    ],
    usage:
      "Aplicar generosamente 15 minutos antes da exposição solar.\nReaplicar a cada 2 horas e após suor intenso, natação ou secar-se com toalha.",
    skinTypes: ["oleosa", "mista"],
    reviews: [
      { user: "Carlos", rating: 4, comment: "Textura leve e acabamento matte." },
      { user: "Bianca", rating: 3, comment: "Boa proteção, poderia ser menos perfumado." },
    ],
  },
  {
    id: "p3",
    name: "Clean Foam Gel",
    brand: "PureSkin",
    category: "limpeza",
    inci: [
      { name: "Aqua", role: "solvent" as any },
      { name: "Cocamidopropyl Betaine", role: "surfactant" },
      { name: "Sodium Laureth Sulfate", role: "surfactant", controversial: ["SLES"] },
      { name: "Aloe Barbadensis Leaf Juice", role: "moisturizer", active: true },
      { name: "Parfum (Fragrance)", role: "fragrance", allergenic: true },
    ],
    usage:
      "Massagear sobre a pele úmida e enxaguar. Usar 1–2x ao dia.",
    skinTypes: ["oleosa", "mista"],
    reviews: [
      { user: "João", rating: 4, comment: "Lava bem e não repuxa." },
      { user: "Vivi", rating: 2, comment: "Achei um pouco agressivo para pele sensível." },
    ],
  },
  {
    id: "p4",
    name: "Night Repair Serum",
    brand: "Reviva",
    category: "anti-idade",
    inci: [
      { name: "Aqua", role: "solvent" as any },
      { name: "Retinol", role: "antioxidant", active: true, controversial: ["fotossensível"] },
      { name: "Niacinamide", role: "antioxidant", active: true },
      { name: "Squalane", role: "emollient" },
      { name: "Phenoxyethanol", role: "preservative" },
    ],
    usage:
      "Aplicar à noite sobre a pele limpa. Iniciar 2–3x/semana e aumentar conforme tolerância. Usar protetor solar durante o dia.",
    skinTypes: ["mista", "normal"],
    reviews: [
      { user: "Priscila", rating: 5, comment: "Pele mais viçosa após 3 semanas." },
      { user: "Renata", rating: 4, comment: "Textura ótima, sem irritar." },
    ],
  },
  {
    id: "p5",
    name: "Hydra Calm Creme",
    brand: "Dermasoft",
    category: "hidratante",
    inci: [
      { name: "Aqua", role: "solvent" as any },
      { name: "Ceramide NP", role: "moisturizer", active: true },
      { name: "Shea Butter (Butyrospermum Parkii)", role: "emollient" },
      { name: "Allantoin", role: "moisturizer" },
      { name: "Methylparaben", role: "preservative", controversial: ["parabeno"] },
    ],
    usage:
      "Aplicar no rosto e pescoço após a limpeza, de manhã e à noite.",
    skinTypes: ["seca", "sensível"],
    reviews: [
      { user: "Luca", rating: 4, comment: "Calmou bastante a vermelhidão." },
      { user: "Bia", rating: 5, comment: "Muito nutritivo, rende bem." },
    ],
  },
  {
    id: "p6",
    name: "AHA 8% Peeling Solution",
    brand: "SkinTune",
    category: "tratamento",
    inci: [
      { name: "Aqua", role: "solvent" as any },
      { name: "Glycolic Acid", role: "exfoliant", active: true, controversial: ["ácido AHA"] },
      { name: "Propylene Glycol", role: "humectant" },
      { name: "Panthenol", role: "moisturizer" },
      { name: "Phenoxyethanol", role: "preservative" },
    ],
    usage:
      "Aplicar à noite 1–2x/semana por até 10 minutos. Enxaguar. Usar protetor solar no dia seguinte.",
    skinTypes: ["mista", "oleosa"],
    reviews: [
      { user: "Marcos", rating: 3, comment: "Esfolia bem, sensação de ardor leve." },
      { user: "Keyla", rating: 4, comment: "Pele mais lisa após 1 mês." },
    ],
  },
];
