"use client";

import s from "../admin.module.css";

export default function AccountsPage() {
  return (
    <div className={s.stack}>
      <section className={s.panel}>
        <div className={s.panelHead}>
          <h3>Account manager</h3>
          <div className={s.filters}>
            <input className={s.input} placeholder="Search name or email…" />
            <select className={s.select}>
              <option>All roles</option><option>Admin</option><option>Member</option>
            </select>
            <select className={s.select}>
              <option>All status</option><option>Active</option><option>Suspended</option>
            </select>
            <button className={s.primary}>Add account</button>
          </div>
        </div>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last active</th><th></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td>Le Thi B {i + 1}</td>
                  <td>acc{i + 1}@imos.com</td>
                  <td>{i % 5 === 0 ? "Admin" : "Member"}</td>
                  <td>{i % 4 === 0 ? <span className={s.badgeWarn}>Suspended</span> : <span className={s.badgeSuccess}>Active</span>}</td>
                  <td>{i % 3 === 0 ? "Today" : "2 days ago"}</td>
                  <td className={s.rowActions}>
                    <button className={s.linkBtn}>View</button>
                    <button className={s.linkBtn}>Edit</button>
                    <button className={s.linkBtn} >Disable</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={s.pagination}>
          <button className={s.pageBtn}>Prev</button>
          <div className={s.pageDots}><b>1</b><span>2</span><span>3</span>…<span>20</span></div>
          <button className={s.pageBtn}>Next</button>
        </div>
      </section>
    </div>
  );
}
