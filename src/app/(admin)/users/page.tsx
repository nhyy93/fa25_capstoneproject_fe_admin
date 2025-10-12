"use client";

import { useEffect, useMemo, useState } from "react";
import s from "../admin.module.css";
import {
  adminGetUsers,
  adminUpdateUserStatus,
  type Paged,
} from "@/lib/api";

type Role = "Admin" | "Member" | string;
type BackendStatus = "Active" | "Suspended" | "Inactive" | "Pending" | string;

type User = {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  status: BackendStatus;
  lastActiveAt?: string | null;
};

const PAGE_SIZE = 10;

const viStatus = (s: BackendStatus) =>
  s === "Suspended" ? "Đã khóa"
  : s === "Inactive" ? "Không hoạt động"
  : s === "Pending" ? "Chờ duyệt"
  : "Hoạt động";

const toggleToBackend = (s: BackendStatus): BackendStatus =>
  s === "Suspended" ? "Active" : "Suspended";

function useDebounce<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function AccountsPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const [roleFilter, setRoleFilter] = useState<"Tất cả" | Role>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<
    "Tất cả" | "Hoạt động" | "Đã khóa" | "Không hoạt động" | "Chờ duyệt"
  >("Tất cả");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const serverStatus =
    statusFilter === "Tất cả"
      ? undefined
      : statusFilter === "Đã khóa"
      ? "Suspended"
      : statusFilter === "Không hoạt động"
      ? "Inactive"
      : statusFilter === "Chờ duyệt"
      ? "Pending"
      : "Active";

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await adminGetUsers<User>({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedQ.trim() || undefined,
          status: serverStatus,
        });
        if (cancelled) return;
        const data = res as Paged<User>;
        setRows(data.items ?? []);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      } catch (e: unknown) {
        if (cancelled) return;
        const msg =
          e instanceof Error ? e.message : "Không thể tải danh sách người dùng.";
        setErr(msg);
        setRows([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQ, serverStatus]);

  const filtered = useMemo(() => {
    if (roleFilter === "Tất cả") return rows;
    return rows.filter((u) => u.role === roleFilter);
  }, [rows, roleFilter]);

  const onToggleStatus = async (u: User) => {
    const next = toggleToBackend(u.status);
    const prev = u.status;

    setRows((arr) =>
      arr.map((x) => (x.userId === u.userId ? { ...x, status: next } : x))
    );

    try {
      await adminUpdateUserStatus<{ status: BackendStatus }, unknown>(u.userId, {
        status: next,
      });
    } catch (e: unknown) {
      setRows((arr) =>
        arr.map((x) => (x.userId === u.userId ? { ...x, status: prev } : x))
      );
      const msg =
        e instanceof Error ? e.message : "Không thể cập nhật trạng thái.";
      alert(msg);
    }
  };

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className={s.stack}>
      <section className={s.panel}>
        <div className={s.panelHead}>
          <h3>Quản lý tài khoản</h3>
          <div className={s.filters}>
            <input
              className={s.input}
              placeholder="Tìm theo tên hoặc email…"
              value={q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
            <select
              className={s.select}
              value={roleFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setPage(1);
                setRoleFilter(e.target.value as Role | "Tất cả");
              }}
            >
              <option value="Tất cả">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
            <select
              className={s.select}
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setPage(1);
                setStatusFilter(
                  e.target.value as
                    | "Tất cả"
                    | "Hoạt động"
                    | "Đã khóa"
                    | "Không hoạt động"
                    | "Chờ duyệt"
                );
              }}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Đã khóa">Đã khóa</option>
              <option value="Không hoạt động">Không hoạt động</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
            </select>
          </div>
        </div>

        <div className={s.tableWrap}>
          {err ? (
            <div className={s.errorBox}>{err}</div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hoạt động gần nhất</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 16 }}>
                      Đang tải...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 16 }}>
                      Không tìm thấy tài nguyên.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.userId}>
                      <td>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        {u.status === "Suspended" ? (
                          <span className={s.badgeWarn}>Đã khóa</span>
                        ) : (
                          <span className={s.badgeSuccess}>
                            {viStatus(u.status)}
                          </span>
                        )}
                      </td>
                      <td>{u.lastActiveAt ? timeAgoVi(u.lastActiveAt) : "–"}</td>
                      <td className={s.rowActions}>
                        <button className={s.linkBtn}>Xem</button>
                        <button className={s.linkBtn}>Sửa</button>
                        <button
                          className={s.linkBtn}
                          onClick={() => onToggleStatus(u)}
                          disabled={loading}
                        >
                          {u.status === "Suspended" ? "Mở khóa" : "Khóa"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className={s.pagination}>
          <button className={s.pageBtn} onClick={prevPage} disabled={page <= 1 || loading}>
            Trước
          </button>
          <div className={s.pageDots}>
            <b>{page}</b>
            {page + 1 <= totalPages && <span>{page + 1}</span>}
            {page + 2 <= totalPages && <span>{page + 2}</span>}
            {page + 3 < totalPages && (
              <>
                …<span>{totalPages}</span>
              </>
            )}
          </div>
          <button className={s.pageBtn} onClick={nextPage} disabled={page >= totalPages || loading}>
            Sau
          </button>
        </div>
      </section>
    </div>
  );
}

function timeAgoVi(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const days = Math.floor(h / 24);
  return `${days} ngày trước`;
}
