import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiMail, FiPhone, FiUser, FiGlobe } from "react-icons/fi";
import { apiFetch, apiUrl, readJson } from "../api";
import { themes } from "../themes";
import "./Home.css";

function Home() {
  const [kategorije, setKategorije] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeTheme = themes.etno;
  const navigate = useNavigate();

  const loadCategories = useCallback(async () => {
    setError("");
    try { setKategorije(await readJson(await apiFetch("/api/categories"))); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadCategories();
    apiFetch("/api/logo").then(readJson).then((data) => setLogoUrl(data.logo ? apiUrl(data.logo) : "")).catch(() => {});
  }, [loadCategories]);

  useEffect(() => {
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") loadCategories(); };
    window.addEventListener("focus", loadCategories);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => { window.removeEventListener("focus", loadCategories); document.removeEventListener("visibilitychange", refreshWhenVisible); };
  }, [loadCategories]);

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  return <div className="home-container" style={{
    ...(activeTheme.backgroundImage ? { backgroundImage: `url(${activeTheme.backgroundImage})` } : { backgroundColor: activeTheme.backgroundColor }),
    backgroundSize: "cover", backgroundPosition: "top center", backgroundRepeat: "no-repeat", fontFamily: activeTheme.font, color: activeTheme.textColor,
  }}>
    <header className="header">
      {logoUrl && <motion.img src={logoUrl} alt="Logo restorana" className="logo" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} />}
      <button className="user-icon-button" onClick={() => navigate("/login")} title="Admin prijava" aria-label="Admin prijava"><FiUser className="user-icon" /></button>
    </header>
    {loading && <p className="page-status">Ucitavanje menija...</p>}
    {error && <div className="page-status" role="alert"><p>{error}</p><button onClick={loadCategories}>Pokusaj ponovo</button></div>}
    {!loading && !error && !kategorije.length && <p className="page-status">Meni trenutno nema kategorije.</p>}
    <motion.div className="kategorije-grid" variants={containerVariants} initial="hidden" animate="visible">
      {kategorije.map((kat) => <motion.button className="kategorija-card" key={kat._id} onClick={() => navigate(`/kategorija/${kat._id}`)} variants={cardVariants} transition={{ duration: 0.4 }}>
        <motion.img className="slika" src={kat.slika?.startsWith("/uploads/") ? apiUrl(kat.slika) : kat.slika} alt={kat.naziv} loading="lazy" decoding="async" style={{ border: `2px solid ${activeTheme.borderColor}`, boxShadow: `0 0 10px ${activeTheme.glowColor}`, objectFit: "cover" }} whileHover={{ scale: 1.12 }} transition={{ duration: 0.2 }} />
        <p>{kat.naziv}</p>
      </motion.button>)}
    </motion.div>
    <footer className="footer">
      <p><FiUser /> Mila Obradovic</p>
      <p><FiMail /> <a href="mailto:milaobradovic2000@gmail.com">milaobradovic2000@gmail.com</a></p>
      <p><FiPhone /> <a href="tel:+38166377737">+381 66 377 737</a></p>
      <p><FiGlobe /> <a href="https://www.milaobradovic.dev" target="_blank" rel="noopener noreferrer">www.milaobradovic.dev</a></p>
    </footer>
  </div>;
}

export default Home;
