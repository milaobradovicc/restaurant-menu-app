import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Home.css";
import { themes } from "../themes";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FiMail, FiPhone, FiUser, FiGlobe } from "react-icons/fi";


function Home() {
  const [kategorije, setKategorije] = useState([]);
  const [activeThemeKey, setActiveThemeKey] = useState("etno");
  const activeTheme = themes[activeThemeKey];
  const slikaSrc = `${process.env.REACT_APP_BACKEND_URL}`;
  const navigate = useNavigate();
  const { id } = useParams(); // Ovo je ID kategorije

  useEffect(() => {
    const fetchData = () => {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`)
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
                  ? `url(${encodeURI(process.env.REACT_APP_BACKEND_URL + kat.slika)})`
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
      <footer className="footer">
        <p><FiUser style={{ marginRight: 6 }} /> Mila Obradović</p>
        <p>
          <FiMail style={{ marginRight: 6 }} />
          <a href="mailto:milaobradovic2000@gmail.com">milaobradovic2000@gmail.com</a>
        </p>
        <p>
          <FiPhone style={{ marginRight: 6 }} />
          <a href="tel:+38166377737">+381 66 377 737</a>
        </p>
        <p>
          <FiGlobe style={{ marginRight: 6 }} />
          <a href="https://www.milaobradovic.dev" target="_blank" rel="noopener noreferrer">
            www.milaobradovic.dev
          </a>
        </p>
      </footer>


    </div>
  );
}

export default Home;
