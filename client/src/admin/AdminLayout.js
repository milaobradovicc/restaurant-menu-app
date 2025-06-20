import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./admin.css";

function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <Link to="/admin" className="admin-header-title">
          Admin panel
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </header>

      <div className="admin-body">
        <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
          <nav>
            <ul>
              <li
                className={
                  location.pathname.includes("kategorije") ? "active" : ""
                }
              >
                <Link to="/admin/kategorije">Kategorije</Link>
              </li>
              <li
                className={
                  location.pathname.includes("proizvodi") ? "active" : ""
                }
              >
                <Link to="/admin/proizvodi">Proizvodi</Link>
              </li>
              <li
                className={location.pathname.includes("logo") ? "active" : ""}
              >
                <Link to="/admin/logo">Logo</Link>
              </li>
              <li
                className={
                  location.pathname.includes("kontakt") ? "active" : ""
                }
              >
                <Link to="/admin/kontakt">Kontakt</Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
