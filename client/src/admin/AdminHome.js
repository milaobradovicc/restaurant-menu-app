import React from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import { Link } from "react-router-dom";

function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <div className="admin-buttons">
        <button onClick={() => navigate("/admin/kategorije")}>
          Kategorije
        </button>
        <button onClick={() => navigate("/admin/proizvodi")}>Proizvodi</button>
        <button onClick={() => navigate("/admin/logo")}>Logo</button>
        <button onClick={() => navigate("/admin/kontakt")}>Kontakt</button>
      </div>
    </div>
  );
}

export default AdminHome;
