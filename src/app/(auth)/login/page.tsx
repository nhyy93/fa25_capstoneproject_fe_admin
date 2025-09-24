"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

async function fakeLogin(): Promise<void> {
  await new Promise((r) => setTimeout(r, 700));
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !pw.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    try {
      setSubmitting(true);
      await fakeLogin();
    } catch {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-emerald-500/15 blur-[90px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-teal-400/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(52,211,153,.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.04)_0%,transparent_40%,rgba(16,185,129,.05)_100%)]" />
        <div className="absolute inset-0 opacity-[.08] [background-image:radial-gradient(#93e7c0_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="absolute left-6 top-6 z-10 flex select-none items-center gap-3">
        <span className="inline-block h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,.18)]" />
        <div>
          <div className="text-sm font-semibold tracking-wide">CustomMapOSM</div>
          <div className="text-[11px] text-white/70">Bản đồ của bạn — nhanh &amp; đơn giản</div>
        </div>
      </div>

      <section className="relative z-10 grid min-h-dvh place-items-center px-4">
        <div className="w-full max-w-[440px] animate-[fadeIn_.5s_ease] rounded-3xl border border-white/10 bg-white/6 p-7 backdrop-blur-[10px] shadow-[0_20px_80px_rgba(0,0,0,.45)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Đăng nhập Admin</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-white/80">Email</label>
              <div className="group relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                    <path d="M3 7.5l8.3 5.1c.42.26.98.26 1.4 0L21 7.5" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="3" y="5" width="18" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-3 py-2.5 text-[15px] placeholder-white/45 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-white/80">Mật khẩu</label>
                <Link href="/(auth)/reset" className="text-xs text-emerald-300 hover:underline">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80">
                    <rect x="4" y="10" width="16" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-10 py-2.5 text-[15px] placeholder-white/45 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/40"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 3-3c0-.4-.08-.78-.22-1.12" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M3 12s3.5-7 9-7 9 7 9 7a16.9 16.9 0 0 1-3.13 3.76" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <label className="inline-flex select-none items-center gap-2 text-xs text-white/80">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 accent-emerald-500" />
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group mt-2 w-full rounded-xl bg-emerald-500/90 py-2.5 font-semibold ring-1 ring-emerald-300/40 transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-2">
                {submitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>Đăng nhập</>
                )}
              </span>
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-white/60">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-[11px] uppercase tracking-wider">Hoặc</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm ring-1 ring-white/0 transition hover:bg-white/10 hover:ring-white/10"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm ring-1 ring-white/0 transition hover:bg-white/10 hover:ring-white/10"
            >
              <FacebookIcon /> Facebook
            </button>
          </div>

        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33 6.1 28.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-9 19.6-20 0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.8 18.9 14 24 14c3 0 5.8 1.1 7.9 3l5.7-5.7C33 6.1 28.7 4 24 4 16 4 9 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c4.6 0 8.8-1.7 12-4.5l-5.6-4.6c-1.6 1.1-3.8 1.8-6.4 1.8-5.3 0-9.7-3.4-11.3-8l-6.6 5C9 39.7 15.9 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.7-6.2 7.3l.1.1 6 4.6c-.4.3 8.8-5.1 8.8-16.5 0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.44H7.078V12.07h3.047V9.413c0-3.007 1.791-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.492 0-1.955.928-1.955 1.88v2.26h3.328l-.532 3.489h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}
