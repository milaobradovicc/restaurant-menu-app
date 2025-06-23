import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Home.css";
import { themes } from "../themes";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function Home() {
  const [kategorije, setKategorije] = useState([]);
  const [activeThemeKey, setActiveThemeKey] = useState("etno");
  const activeTheme = themes[activeThemeKey];
  const slikaSrc = `https://restaurant-menu-app-nzfr.onrender.com`;
  const navigate = useNavigate();
  const { id } = useParams(); // Ovo je ID kategorije

  useEffect(() => {
    const fetchData = () => {
      fetch(`https://restaurant-menu-app-nzfr.onrender.com/api/categories`)
        .then((res) => res.json())
        .then((data) => {
          const sortirano = data.sort(
            (a, b) => (a.redniBroj ?? 0) - (b.redniBroj ?? 0)
          );
          setKategorije(sortirano);
        })
        .catch((err) =>
          console.error("Greška pri učitavanju kategorija:", err)
        );
    };

    fetchData();

    const interval = setInterval(() => {
      if (localStorage.getItem("refreshHomeKategorije") === "true") {
        fetchData();
        localStorage.removeItem("refreshHomeKategorije");
      }
    }, 1000); // proverava svake sekunde

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15, // koliko da čeka između kartica
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="home-container"
      style={{
        ...(activeTheme.backgroundImage
          ? { backgroundImage: `url(${activeTheme.backgroundImage})` }
          : { backgroundColor: activeTheme.backgroundColor }),
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        fontFamily: activeTheme.font,
        color: activeTheme.textColor,
      }}
    >
      <select
        value={activeThemeKey}
        onChange={(e) => setActiveThemeKey(e.target.value)}
        className="theme-selector"
      >
        {Object.keys(themes).map((key) => (
          <option key={key} value={key}>
            {themes[key].name}
          </option>
        ))}
      </select>

      <header className="header">
        <motion.img
          src="/images/logoRestoran1.png"
          alt="Logo"
          className="logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </header>

      <motion.div
        className="kategorije-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {kategorije.map((kat, index) => (
          <motion.div
            className="kategorija-card"
            key={index}
            onClick={() => navigate(`/kategorija/${kat._id}`)}
            variants={cardVariants}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="slika"
              style={{
                backgroundImage: kat.slika?.startsWith("/uploads/")
                  ? `https://restaurant-menu-app-nzfr.onrender.com${kat.slika})`
                  : `url(${kat.slika})`,
                border: `2px solid ${activeTheme.borderColor}`,
                boxShadow: `0 0 10px ${activeTheme.glowColor}`,
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 1.05 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
            <p>{kat.naziv}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Home;
