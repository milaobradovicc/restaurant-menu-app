import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Proizvodi.css";
import { motion, AnimatePresence } from "framer-motion";

function Proizvodi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proizvodi, setProizvodi] = useState([]);
  const [kategorijaNaziv, setKategorijaNaziv] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [prikaziLogo, setPrikaziLogo] = useState(true);
  const [prikaziPopup, setPrikaziPopup] = useState(false);
  const [popupSlika, setPopupSlika] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/kategorija/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProizvodi(data.proizvodi || []);
        setKategorijaNaziv(data.kategorija || "Kategorija");
        document.title = `Kategorija: ${data.kategorija || "Kategorija"}`;
      })
      .catch((err) => {
        console.error("Greška pri učitavanju proizvoda:", err);
      });
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setPrikaziLogo(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultImage = "/images/logoRestoran1.png"; // <- zameni ako treba

  return (
    <div className="proizvodi-page">
      {/* Dugme Nazad */}
      <button className="back-btn" onClick={() => navigate("/")}>
        <b>← </b>Nazad
      </button>

      {/* Logo u gornjem desnom uglu */}
      {prikaziLogo && (
        <motion.img
          src="/images/logoRestoran1.png"
          alt="Logo"
          className="logo-fixed"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      )}

      <motion.h2
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="kategorija-naslov"
      >
        {kategorijaNaziv}
      </motion.h2>

      <div className="proizvodi-lista">
        {proizvodi.map((p, index) => (
          <motion.div
            className="proizvod"
            key={p._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
          >
            <div className="proizvod-info">
              <h3>{p.naziv}</h3>
              <p>{p.opis}</p>
              <div className="cena">{p.cena.toFixed(2)} RSD</div>
            </div>
            <img
              src={
                p.slika
                  ? p.slika.startsWith("/uploads/")
                    ? `${process.env.REACT_APP_BACKEND_URL}${p.slika}`
                    : p.slika
                  : defaultImage
              }
              alt={p.naziv}
              className="proizvod-slika"
              onClick={() => {
                setPopupSlika(
                  p.slika
                    ? p.slika.startsWith("/uploads/")
                      ? `${process.env.REACT_APP_BACKEND_URL}${p.slika}`
                      : p.slika
                    : defaultImage
                );
                setPrikaziPopup(true);
              }}
            />
          </motion.div>
        ))}
      </div>

      {showScrollTop && (
        <motion.button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          ↑
        </motion.button>
      )}
      <AnimatePresence>
        {prikaziPopup && (
          <motion.div
            className="popup-overlay"
            onClick={() => setPrikaziPopup(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="popup-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img src={popupSlika} alt="Preview" />
              <button
                onClick={() => setPrikaziPopup(false)}
                className="zatvori-btn"
              >
                Zatvori ✖
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Proizvodi;
