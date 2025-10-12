"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMapTemplates, type MapTemplate } from "@/lib/api";

type Sample = {
  key: string;
  title: string;
  author: string;
  lastViewed: string;
  blurb: string;
  templateId?: string;
  preset?: {
    name: string;
    description?: string;
    baseMapProvider?: "OSM" | "Satellite" | "Dark";
    initialLatitude: number;
    initialLongitude: number;
    initialZoom: number;
  };
};

const SAMPLES: Sample[] = [
  {
    key: "reservoir-precip",
    title: "Example: Reservoir Levels & Precipitation",
    author: "Yen Nhi Dang",
    lastViewed: "Last viewed 3 months ago",
    blurb: "Combine reservoir level overlays with accumulated precipitation.",
    preset: {
      name: "Reservoir Levels & Precip",
      baseMapProvider: "OSM",
      initialLatitude: 15.95,
      initialLongitude: 107.8,
      initialZoom: 5,
    },
  },
  {
    key: "sandy-inundation",
    title: "Example: Hurricane Sandy Inundation Zone",
    author: "Yen Nhi Dang",
    lastViewed: "Last viewed 3 months ago",
    blurb: "Historic storm surge zones for quick risk illustration.",
    preset: {
      name: "Sandy Inundation Zone",
      baseMapProvider: "OSM",
      initialLatitude: 40.71,
      initialLongitude: -74.0,
      initialZoom: 10,
    },
  },
  {
    key: "bike-collisions",
    title: "Example: City of Toronto Bike Collisions",
    author: "Yen Nhi Dang",
    lastViewed: "Last viewed 3 months ago",
    blurb: "Point dataset for bicycle collision safety analysis.",
    preset: {
      name: "Toronto Bike Collisions",
      baseMapProvider: "OSM",
      initialLatitude: 43.65,
      initialLongitude: -79.38,
      initialZoom: 11,
    },
  },
  {
    key: "sales-territories",
    title: "Example: Sales Territories",
    author: "Yen Nhi Dang",
    lastViewed: "Last viewed 3 months ago",
    blurb: "Territory boundaries and regional assignments.",
    preset: {
      name: "Sales Territories",
      baseMapProvider: "OSM",
      initialLatitude: 39.5,
      initialLongitude: -98.35,
      initialZoom: 4,
    },
  },
  {
    key: "getting-started",
    title: "Getting started with Felt",
    author: "Yen Nhi Dang",
    lastViewed: "Last viewed 3 months ago",
    blurb: "Onboarding sample with basic point and area layers.",
    preset: {
      name: "Getting Started",
      baseMapProvider: "OSM",
      initialLatitude: 21.03,
      initialLongitude: 105.85,
      initialZoom: 11,
    },
  },
];

function Thumb({ k }: { k: string }) {
  const palette: Record<string, string> = {
    "reservoir-precip": "from-cyan-700 to-emerald-700",
    "sandy-inundation": "from-amber-600 to-rose-600",
    "bike-collisions": "from-fuchsia-700 to-indigo-700",
    "sales-territories": "from-emerald-700 to-teal-700",
    "getting-started": "from-zinc-700 to-zinc-800",
  };
  const bg = palette[k] ?? "from-zinc-700 to-zinc-800";
  return (
    <div className={`h-32 w-full rounded-lg border border-white/10 bg-gradient-to-br ${bg} grid place-items-center`}>
      <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm" />
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [items, setItems] = useState<MapTemplate[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await getMapTemplates();
        setItems(list ?? []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Không tải được danh sách template");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((t) =>
      [t.templateName, t.description, t.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, items]);

  const goCreateFromSample = (s: Sample) => {
    const payload = encodeURIComponent(
      JSON.stringify({
        templateId: s.templateId ?? null,
        preset: s.preset ?? null,
        blurb: s.blurb,
        title: s.title,
        key: s.key,
      })
    );
    router.push(`/templates/new?from=${payload}`);
  };

  return (
    <main className="p-6 text-white">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <div className="ml-auto flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates…"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
          <Link
            href="/templates/new"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            + Create template
          </Link>
        </div>
      </div>

      {loading && <div className="text-zinc-400">Đang tải…</div>}
      {err && !loading && <div className="text-red-400">{err}</div>}
      {!loading && !err && filtered.length === 0 && <EmptyState />}
      {!loading && !err && filtered.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.templateId} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                {t.previewImageUrl ? (
                  <img src={t.previewImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-600 text-sm">No preview</div>
                )}
              </div>
              <div className="mb-1 line-clamp-1 text-base font-medium">{t.templateName}</div>
              <div className="mb-2 text-xs text-zinc-400 line-clamp-2">{t.description || "—"}</div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{t.category}</span>
                {typeof t.layerCount === "number" && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{t.layerCount} layers</span>
                )}
                {typeof t.featureCount === "number" && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">{t.featureCount} features</span>
                )}
                <span className="ml-auto text-[11px] text-zinc-500">{t.isPublic ? "Public" : "Private"}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/templates/${t.templateId}`}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900"
                >
                  View
                </Link>
                <Link
                  href={`/templates/thu-duc-map`}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700"
                >
                  Open tool
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <section className="mt-10 mb-10">
        <h2 className="mb-3 text-lg font-semibold">Examples</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SAMPLES.map((s) => (
            <li key={s.key} className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <Thumb k={s.key} />
              <div className="mt-3">
                <div className="font-semibold truncate">{s.title}</div>
                <div className="text-xs text-zinc-400">{s.author}</div>
              </div>
              <p className="mt-2 text-sm text-zinc-300 line-clamp-2">{s.blurb}</p>
              <div className="mt-2 text-xs text-zinc-400">{s.lastViewed}</div>
              <div className="mt-3">
                <button
                  onClick={() => goCreateFromSample(s)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-900 text-sm font-semibold hover:bg-emerald-400"
                >
                  Use this template
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
      <div className="mb-2 text-lg font-medium">No templates</div>
      <p className="mb-4 text-sm text-zinc-400">Hãy tạo mới một template để bắt đầu.</p>
      <Link
        href="/templates/new"
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
      >
        + Create template
      </Link>
    </div>
  );
}
