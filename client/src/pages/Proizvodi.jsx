import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch, apiUrl, readJson } from "../api";
import "./Proizvodi.css";

function Proizvodi() {
  const { id } = useParams(); const navigate = useNavigate();
  const [data, setData] = useState({ proizvodi: [], kategorija: "" });
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false); const [popupSlika, setPopupSlika] = useState("");

  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    apiFetch(`/api/products/kategorija/${id}`, { signal: controller.signal }).then(readJson).then((result) => {
      setData(result); document.title = `${result.kategorija} | Restaurant Menu`;
    }).catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const imageUrl = (path) => path?.startsWith("/uploads/") ? apiUrl(path) : path || "/images/logoRestoran1.png";
  return <div className="proizvodi-page">
    <button className="back-btn" onClick={() => navigate("/")}><b>← </b>Nazad</button>
    {!showScrollTop && <motion.img src="/images/logoRestoran1.png" alt="Logo" className="logo-fixed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
    <motion.h2 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="kategorija-naslov">{data.kategorija || "Kategorija"}</motion.h2>
    {loading && <p className="page-status">Ucitavanje proizvoda...</p>}
    {error && <p className="page-status" role="alert">{error}</p>}
    {!loading && !error && !data.proizvodi.length && <p className="page-status">U ovoj kategoriji trenutno nema proizvoda.</p>}
    <div className="proizvodi-lista">{data.proizvodi.map((p, index) => <motion.article className={`proizvod ${p.nedostupan ? "nedostupan" : ""}`} key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.5) }}>
      {p.nedostupan && <div className="nedostupan-overlay">Trenutno nedostupno</div>}{p.novo && <div className="novo-badge">Novo</div>}
      <div className="proizvod-info"><h3>{p.naziv}</h3><p>{p.opis}</p><div className="cena">{Number(p.cena).toFixed(2)} RSD</div></div>
      <button className="image-button" onClick={() => setPopupSlika(imageUrl(p.slika))} aria-label={`Uvecaj sliku: ${p.naziv}`}><img src={imageUrl(p.slika)} alt={p.naziv} className="proizvod-slika" loading="lazy" decoding="async" /></button>
    </motion.article>)}</div>
    {showScrollTop && <motion.button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Povratak na vrh" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>↑</motion.button>}
    <AnimatePresence>{popupSlika && <motion.div className="popup-overlay" onClick={() => setPopupSlika("")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true"><motion.div className="popup-box" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}><img src={popupSlika} alt="Uvecan prikaz proizvoda" /><button onClick={() => setPopupSlika("")} className="zatvori-btn">Zatvori ×</button></motion.div></motion.div>}</AnimatePresence>
  </div>;
}

export default Proizvodi;
