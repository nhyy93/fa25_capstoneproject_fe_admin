"use client";

import { useEffect, useState } from "react";
import s from "../admin.module.css";
import {
  adminGetSubscriptionPlans,
  adminActivateSubscriptionPlan,
  adminDeactivateSubscriptionPlan,
} from "@/lib/api";

type SubscriptionPlan = {
  planId: number;
  planName: string;
  price: number;
  durationDays: number;
  isActive: boolean;
};

export default function PlansPage() {
  const [rows, setRows] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const isPlan = (x: unknown): x is SubscriptionPlan => {
      if (typeof x !== "object" || x === null) return false;
      const o = x as Record<string, unknown>;
      return (
        typeof o.planId === "number" &&
        typeof o.planName === "string" &&
        typeof o.price === "number" &&
        typeof o.durationDays === "number" &&
        typeof o.isActive === "boolean"
      );
    };

    const isPlansArray = (x: unknown): x is SubscriptionPlan[] =>
      Array.isArray(x) && x.every(isPlan);

    const hasItemsArray = (x: unknown): x is { items: SubscriptionPlan[] } => {
      if (typeof x !== "object" || x === null) return false;
      const items = (x as Record<string, unknown>).items;
      return Array.isArray(items) && items.every(isPlan);
    };

    const run = async () => {
      if (cancelled) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await adminGetSubscriptionPlans<unknown>();

        let list: SubscriptionPlan[] = [];
        if (isPlansArray(res)) {
          list = res;
        } else if (hasItemsArray(res)) {
          list = res.items;
        }

        if (!cancelled) setRows(list);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg =
            e instanceof Error
              ? e.message
              : "Không thể tải danh sách gói đăng ký.";
          setErr(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (p: SubscriptionPlan) => {
    const prev = rows;
    setRows((arr) =>
      arr.map((x) =>
        x.planId === p.planId ? { ...x, isActive: !x.isActive } : x
      )
    );

    try {
      if (p.isActive) {
        await adminDeactivateSubscriptionPlan(p.planId);
      } else {
        await adminActivateSubscriptionPlan(p.planId);
      }
    } catch (e: unknown) {
      setRows(prev);
      const msg =
        e instanceof Error ? e.message : "Không thể thay đổi trạng thái gói.";
      alert(msg);
    }
  };

  return (
    <div className={s.stack}>
      <section className={s.panel}>
        <div className={s.panelHead}>
          <h3>Quản lý gói đăng ký</h3>
        </div>
        <div className={s.tableWrap}>
          {err ? (
            <div className={s.errorBox}>{err}</div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Tên gói</th>
                  <th>Giá (VND)</th>
                  <th>Thời hạn (ngày)</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  <tr><td colSpan={5}>Đang tải...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={5}>Không có gói nào.</td></tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.planId}>
                      <td>{p.planName}</td>
                      <td>{Number(p.price).toLocaleString("vi-VN")}</td>
                      <td>{p.durationDays}</td>
                      <td>
                        {p.isActive ? (
                          <span className={s.badgeSuccess}>Đang hoạt động</span>
                        ) : (
                          <span className={s.badgeWarn}>Ngừng</span>
                        )}
                      </td>
                      <td className={s.rowActions}>
                        <button className={s.linkBtn}>Sửa</button>
                        <button
                          className={s.linkBtn}
                          onClick={() => toggle(p)}
                          disabled={loading}
                        >
                          {p.isActive ? "Ngừng" : "Kích hoạt"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
