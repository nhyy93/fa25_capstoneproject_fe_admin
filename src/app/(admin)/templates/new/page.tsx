"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BaseMap = "OSM" | "Satellite" | "Dark";

type PresetPayload = {
  templateId: string | null;
  blurb?: string;
  title?: string;
  preset: {
    name: string;
    description?: string;
    baseMapProvider?: BaseMap;
    initialLatitude: number;
    initialLongitude: number;
    initialZoom: number;
  } | null;
};

function NewTemplateInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [layerName, setLayerName] = useState("Lớp chính");
  const [category, setCategory] = useState("Chung");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [base, setBase] = useState<BaseMap>("OSM");
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState<number | undefined>(undefined);

  useEffect(() => {
    const raw = sp.get("from");
    if (!raw) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as PresetPayload;
      if (parsed?.preset) {
        setName(parsed.preset.name ?? parsed.title ?? "");
        setDesc(parsed.preset.description ?? parsed.blurb ?? "");
        setBase(parsed.preset.baseMapProvider ?? "OSM");
        setLat(parsed.preset.initialLatitude);
        setLng(parsed.preset.initialLongitude);
        setZoom(parsed.preset.initialZoom);
      }
    } catch {
      // bỏ qua lỗi parse
    }
  }, [sp]);

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Vui lòng chọn tệp bản đồ.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("geoJsonFile", file);
      formData.append("templateName", name);
      formData.append("description", desc);
      formData.append("layerName", layerName);
      formData.append("category", category);
      formData.append("isPublic", String(isPublic));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/maps/create-template`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setMessage("Tạo mẫu thành công!");
      setTimeout(() => router.push(`/templates/${json.templateId}`), 900);
    } catch {
      setMessage("Tạo mẫu thất bại. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const onBaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBase(e.target.value as BaseMap);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };
  const toNumOrUndefined = (v: string) => (v === "" ? undefined : Number(v));

  const label = "text-sm text-zinc-300";
  const input =
    "w-full rounded-lg bg-zinc-900/70 border border-white/10 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40";
  const select =
    "w-full rounded-lg bg-zinc-900/70 border border-white/10 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/40";
  const fileInput =
    "block w-full rounded-lg bg-zinc-900/70 border border-white/10 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-zinc-200 hover:file:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/40";
  const smallInput =
    "rounded-lg bg-zinc-900/70 border border-white/10 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/40";

  return (
    <main className="p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold mb-5">Tạo mẫu bản đồ</h1>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
              <div className="grid gap-4">
                <div>
                  <label className={label}>Tên mẫu</label>
                  <input
                    className={input}
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    placeholder="Nhập tên mẫu"
                  />
                </div>

                <div>
                  <label className={label}>Mô tả</label>
                  <textarea
                    className={`${input} resize-y min-h-[110px]`}
                    value={desc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDesc(e.target.value)
                    }
                    placeholder="Mô tả ngắn gọn về mẫu (không bắt buộc)"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Tên lớp (layer)</label>
                    <input
                      className={input}
                      value={layerName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLayerName(e.target.value)
                      }
                      placeholder="VD: Đường chính"
                    />
                  </div>
                  <div>
                    <label className={label}>Danh mục</label>
                    <select
                      className={select}
                      value={category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCategory(e.target.value)
                      }
                    >
                      <option value="Chung">Chung</option>
                      <option value="Hạ tầng">Hạ tầng</option>
                      <option value="Môi trường">Môi trường</option>
                      <option value="Dân số">Dân số</option>
                      <option value="Kinh tế">Kinh tế</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="isPublic"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-zinc-900/70 text-emerald-500 focus:ring-emerald-400/40"
                    checked={isPublic}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setIsPublic(e.target.checked)
                    }
                  />
                  <label htmlFor="isPublic" className={label}>
                    Công khai mẫu này
                  </label>
                </div>

                <div>
                  <label className={label}>
                    Tải tệp bản đồ (GeoJSON, KML, GPX, CSV, XLSX, GeoTIFF)
                  </label>
                  <input
                    type="file"
                    accept=".geojson,.kml,.gpx,.csv,.xlsx,.tiff,.tif"
                    onChange={onFileChange}
                    className={fileInput}
                  />
                  {file && (
                    <div className="mt-2 text-xs text-zinc-400">
                      {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-[1fr,1fr,1fr,1fr] gap-3">
                  <div>
                    <label className={label}>Bản đồ nền</label>
                    <select className={select} value={base} onChange={onBaseChange}>
                      <option value="OSM">OSM</option>
                      <option value="Satellite">Vệ tinh</option>
                      <option value="Dark">Tối</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>Vĩ độ (Lat)</label>
                    <input
                      className={smallInput + " w-full"}
                      type="number"
                      step="0.0001"
                      value={lat ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLat(toNumOrUndefined(e.target.value))
                      }
                      placeholder="VD: 21.0278"
                    />
                  </div>
                  <div>
                    <label className={label}>Kinh độ (Lng)</label>
                    <input
                      className={smallInput + " w-full"}
                      type="number"
                      step="0.0001"
                      value={lng ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLng(toNumOrUndefined(e.target.value))
                      }
                      placeholder="VD: 105.8342"
                    />
                  </div>
                  <div>
                    <label className={label}>Thu phóng (Zoom)</label>
                    <input
                      className={smallInput + " w-full"}
                      type="number"
                      value={zoom ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setZoom(toNumOrUndefined(e.target.value))
                      }
                      placeholder="VD: 10"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={busy}
                    className="w-full rounded-xl bg-emerald-500 text-zinc-900 font-semibold px-4 py-2.5 hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {busy ? "Đang tạo..." : "Tạo mẫu"}
                  </button>
                  {message && (
                    <div className="mt-3 text-sm text-zinc-300">{message}</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                <div className="text-sm font-semibold mb-2">Mẹo</div>
                <ul className="text-sm text-zinc-300 list-disc pl-5 space-y-1">
                  <li>
                    Ưu tiên dùng <b>GeoJSON</b>{" "}
                    <span className="text-zinc-400">
                      (chất lượng tốt & xử lý nhanh)
                    </span>
                  </li>
                  <li>Kích thước tệp nên {"< 10MB"} để tải nhanh</li>
                  <li>Đặt tên lớp (layer) ngắn gọn, dễ hiểu</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                <div className="text-sm font-semibold mb-2">
                  Định dạng được hỗ trợ
                </div>
                <div className="text-sm text-zinc-300">
                  .geojson, .kml, .gpx, .csv, .xlsx, .tif, .tiff
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function NewTemplatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Đang tải...</div>}>
      <NewTemplateInner />
    </Suspense>
  );
}
