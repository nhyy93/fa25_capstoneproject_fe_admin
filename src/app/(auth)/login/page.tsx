"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import s from "./admin-login.module.css";

async function fakeLogin(): Promise<void> {
  await new Promise((r) => setTimeout(r, 700));
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email.trim() || !pw.trim()) { setErr("Please enter both email and password."); return; }
    try {
      setBusy(true);
      await fakeLogin();
      router.push("/admin");
    } catch {
      setErr("Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={s.wrap}>
      <header className={s.brandBar}>
        <span className={s.logoDot} />
        <div className={s.brandWrap}>
          <span className={s.brand}>IMOS</span>
          <span className={s.tagline}>Smart mapping solution</span>
        </div>
      </header>

      <section className={s.card}>
        <h1 className={s.title}>Admin Login</h1>
        <p className={s.sub}>Please enter your credentials to continue</p>

        {err && <div className={s.bannerError}>{err}</div>}

        <form className={s.form} onSubmit={onSubmit} noValidate>
          <label className={s.label}>
            Email
            <input
              className={s.input}
              type="email"
              placeholder="admin@imos.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className={s.label}>
            Password
            <div className={s.pwdWrap}>
              <input
                className={`${s.input} ${s.inputPwd}`}
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                className={s.eyeBtn}
                onClick={() => setShow(v => !v)}
              >
                {show ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M3 12s4.5-7.5 11-7.5S23 12 23 12s-4.5 7.5-11 7.5S3 12 3 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M2 12s4.5-7.5 10-7.5S22 12 22 12s-4.5 7.5-10 7.5S2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button className={s.primaryBtn} type="submit" disabled={busy || !email || !pw}>
            {busy ? "Logging in…" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
