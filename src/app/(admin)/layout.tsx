"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import s from "./admin.module.css";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <DashIcon /> },
  { href: "/users", label: "Account manager", icon: <UsersIcon /> },
  { href: "/exports", label: "Exports", icon: <FileIcon /> },
  { href: "/billing", label: "Billing history", icon: <CardIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <div className={s.shell}>
      <aside className={`${s.sidebar} ${open ? s.sideOpen : s.sideClosed}`}>
        <div className={s.brandRow}>
          <span className={s.brandDot} />
          <span className={s.brand}>IMOS</span>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${s.navItem} ${
                pathname === href || pathname.startsWith(href + "/") ? s.active : ""
              }`}
            >
              <span className={s.ic}>{icon}</span>
              <span className={s.navText}>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={s.sideFooter}>
          <button className={s.ghostBtn}>
            <span className={s.ic}><SettingsIcon /></span>
            <span>Settings</span>
          </button>
          <button className={s.ghostBtn}>
            <span className={s.ic}><SignOutIcon /></span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className={s.main}>
        <header className={s.header}>
          <button className={s.sideToggler} onClick={() => setOpen(v => !v)}>
            <BurgerIcon />
          </button>
          <div className={s.searchWrap}>
            <input className={s.search} placeholder="Search…" />
          </div>
          <div className={s.headRight}>
            <button className={s.iconBtn}><BellIcon /></button>
            <div className={s.avatar} />
          </div>
        </header>

        <div className={s.content}>{children}</div>
      </div>
    </div>
  );
}

function DashIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="13" y="3" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="13" y="10" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/></svg>)}
function UsersIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M20 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3a4 4 0 0 1 0 8" stroke="currentColor" strokeWidth="2"/></svg>)}
function FileIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" stroke="currentColor" strokeWidth="2"/><path d="M14 2v5h5" stroke="currentColor" strokeWidth="2"/></svg>)}
function CardIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M2 9h20" stroke="currentColor" strokeWidth="2"/><rect x="6" y="13" width="6" height="2" rx="1" fill="currentColor"/></svg>)}
function SettingsIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.04.05a2 2 0 1 1-2.83 2.83l-.05-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .33l-.05.03a2 2 0 0 1-3.9 0l-.05-.03a1.7 1.7 0 0 0-1-.33 1.7 1.7 0 0 0-1.87.34l-.05.04a2 2 0 1 1-2.83-2.83l.04-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.33-1l-.03-.05a2 2 0 0 1 0-3.9l.03-.05a1.7 1.7 0 0 0 .33-1A1.7 1.7 0 0 0 3.23 6l-.04-.05a2 2 0 1 1 2.83-2.83L6.07 3.1A1.7 1.7 0 0 0 7 3.43c.34 0 .68-.11 1-.33l.05-.03a2 2 0 0 1 3.9 0l.05.03c.32.22.66.33 1 .33.33 0 .67-.11 1-.33l.05-.03a2 2 0 1 1 2.78 2.88l-.04.05c-.22.32-.33.66-.33 1 0 .33.11.67.33 1l.04.05a2 2 0 0 1 0 3.9l-.04.05c-.22.32-.33.66-.33 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>)}
function SignOutIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/><path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2"/><path d="M21 12H9" stroke="currentColor" strokeWidth="2"/></svg>)}
function BurgerIcon(){return(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>)}
function BellIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" stroke="currentColor" strokeWidth="2"/><path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2"/></svg>)}
