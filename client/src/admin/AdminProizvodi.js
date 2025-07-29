import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./admin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSort } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { FiList } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

function AdminProizvodi() {
  const sensors = useSensors(useSensor(PointerSensor));
  const [kategorije, setKategorije] = useState([]);
  const [aktivnaKategorija, setAktivnaKategorija] = useState(null);
  const [proizvodi, setProizvodi] = useState([]);
  const [reorderedProizvodi, setReorderedProizvodi] = useState([]);
  const [urediRaspored, setUrediRaspored] = useState(false);
  const [previewSlika, setPreviewSlika] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [novProizvod, setNovProizvod] = useState({
    naziv: "",
    opis: "",
    cena: "",
  });
  const [slikaFile, setSlikaFile] = useState(null);
  const [editProizvod, setEditProizvod] = useState(null);
  const [proizvodZaBrisanje, setProizvodZaBrisanje] = useState(null);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovProizvod((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNovo = (id) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${id}/toggle-novo`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((updated) => {
        setProizvodi((prev) =>
          prev.map((p) => (p._id === id ? { ...p, novo: updated.novo } : p))
        );
      })
      .catch((err) => {
        console.error("Greška pri ažuriranju 'novo':", err);
      });
  };


  const potvrdiBrisanjeProizvoda = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${proizvodZaBrisanje._id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Greška");
        setProizvodi((prev) => prev.filter((p) => p._id !== proizvodZaBrisanje._id));
        setProizvodZaBrisanje(null);
        toast.success("Proizvod uspešno obrisan");
      })
      .catch(() => toast.error("Greška pri brisanju proizvoda"));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("naziv", novProizvod.naziv);
    formData.append("opis", novProizvod.opis);
    formData.append("cena", novProizvod.cena);
    formData.append("kategorijaId", aktivnaKategorija._id);
    if (slikaFile) formData.append("slika", slikaFile);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Greška prilikom slanja");
        return res.json();
      })
      .then((novi) => {
        setProizvodi((prev) => [...prev, novi]); // dodaš odmah novi u listu
        toast.success("Proizvod uspešno dodat!");
        setShowModal(false);
        setNovProizvod({ naziv: "", opis: "", cena: "" });
        setSlikaFile(null);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Greška pri dodavanju proizvoda");
      });
  };



  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        const sortirano = data.sort((a, b) => a.redniBroj - b.redniBroj);
        setKategorije(sortirano);
      })
      .catch(() => toast.error("Greška pri učitavanju kategorija"));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300); // prikazuje dugme posle 300px skrola
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!aktivnaKategorija) return;

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/products/kategorija/${aktivnaKategorija._id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProizvodi(data.proizvodi);
      })
      .catch(() => toast.error("Greška pri učitavanju proizvoda"));
  }, [aktivnaKategorija]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const currentList = reorderedProizvodi.length
        ? reorderedProizvodi
        : proizvodi;
      const oldIndex = currentList.findIndex((item) => item._id === active.id);
      const newIndex = currentList.findIndex((item) => item._id === over.id);
      const newOrder = arrayMove(currentList, oldIndex, newIndex);
      setReorderedProizvodi(newOrder);
    }
  };

  const sacuvajRaspored = () => {
    const nizZaSlanje = reorderedProizvodi.length
      ? reorderedProizvodi
      : proizvodi;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proizvodi: nizZaSlanje.map((p, i) => ({
          _id: p._id,
          redniBroj: i,
          kategorijaId: aktivnaKategorija._id,
        })),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Raspored sačuvan");
        setProizvodi(nizZaSlanje);
        setReorderedProizvodi([]);
        setUrediRaspored(false);
      })
      .catch(() => toast.error("Greška pri čuvanju rasporeda"));
  };

  return (
    <div>
      <h2>Proizvodi</h2>

      {!aktivnaKategorija ? (
        <>
          <p>Izaberite kategoriju:</p>
          <div className="kategorije-grid-admin">
            {kategorije.map((kat) => (
              <div
                key={kat._id}
                className="kategorija-card-admin"
                onClick={() => setAktivnaKategorija(kat)}
              >
                <div
                  className="kategorija-slika"
                  style={{
                    backgroundImage: `url(${process.env.REACT_APP_BACKEND_URL}${kat.slika})`,
                  }}
                ></div>
                <p className="kategorija-naziv">{kat.naziv}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Dugmad za upravljanje proizvodima */}
          {aktivnaKategorija && (
            <div className="admin-button-group">
              <button className="admin-back-icon" onClick={() => setAktivnaKategorija(null)}>
                <FiArrowLeft />
              </button>



              <button className="admin-add-btn" onClick={() => setShowModal(true)}>
                <FiPlus style={{ marginRight: "8px" }} />
                Dodaj proizvod
              </button>

              <button
                className="admin-reorder-btn"
                onClick={() => {
                  if (urediRaspored) {
                    const nizZaSlanje = reorderedProizvodi.length
                      ? reorderedProizvodi
                      : proizvodi;

                    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/reorder`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        proizvodi: nizZaSlanje.map((p, i) => ({
                          _id: p._id,
                          redniBroj: i,
                        })),
                      }),
                    })
                      .then((res) => res.json())
                      .then(() => {
                        toast.success("Raspored uspešno sačuvan!");
                        setProizvodi(nizZaSlanje);
                        setReorderedProizvodi([]);
                        setUrediRaspored(false);
                      })
                      .catch(() => toast.error("Greška pri čuvanju rasporeda"));
                  } else {
                    setUrediRaspored(true);
                  }
                }}
              >
                <FaSort style={{ marginRight: "8px" }} />
                {urediRaspored ? "Sačuvaj raspored i izađi" : "Promeni raspored"}
              </button>
            </div>
          )}


          <p className="admin-count">
            <FiList style={{ marginRight: "8px", fontSize: "22px" }} />
            Ukupno proizvoda: {reorderedProizvodi.length || proizvodi.length}  u kategoriji:  {" "}
            <strong>{aktivnaKategorija.naziv}</strong>
          </p>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
            ✔️ Ako označite <b>Nedostupno</b> ili <b>Novo</b>, korisnicima će se to prikazati na meniju.
          </p>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
            💡 Nove proizvode možete rasporediti na vrh, a nedostupne na dno strane.
          </p>



          <table className="admin-table proizvodi-table">
            <thead>
              <tr>
                <th>Novo</th>
                <th>Naziv</th>
                <th>Opis</th>
                <th>Cena</th>
                <th>Slika</th>
                <th>Nedostupno</th>
                <th></th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={(reorderedProizvodi.length ? reorderedProizvodi : proizvodi).map((p) => p._id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {(reorderedProizvodi.length ? reorderedProizvodi : proizvodi).map((p) => (
                    <SortableItem key={p._id} kat={p} urediRaspored={urediRaspored}>
                      <td data-label="Novo" className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={p.novo}
                          onChange={() => toggleNovo(p._id)}
                        />
                      </td>

                      <td data-label="Naziv">{p.naziv}</td>
                      <td data-label="Opis">{p.opis || "-"}</td>
                      <td data-label="Cena">{p.cena} RSD</td>
                      <td data-label="Slika">
                        {p.slika ? (
                          <img
                            src={
                              p.slika.startsWith("/uploads/")
                                ? `${process.env.REACT_APP_BACKEND_URL}${p.slika}`
                                : p.slika
                            }
                            width="50"
                            alt="slika"
                            className="admin-thumb"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setPreviewSlika(
                                p.slika.startsWith("/uploads/")
                                  ? `${process.env.REACT_APP_BACKEND_URL}${p.slika}`
                                  : p.slika
                              )
                            }
                          />
                        ) : (
                          "Nema slike"
                        )}
                      </td>
                      <td data-label="Nedostupno" className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={p.nedostupan}
                          onChange={() => {
                            fetch(
                              `${process.env.REACT_APP_BACKEND_URL}/api/products/${p._id}/toggle`,
                              { method: "PATCH" }
                            )
                              .then(() => {
                                setProizvodi((prev) =>
                                  prev.map((item) =>
                                    item._id === p._id
                                      ? { ...item, nedostupan: !item.nedostupan }
                                      : item
                                  )
                                );
                              })
                              .catch(() => toast.error("Greška pri ažuriranju"));
                          }}
                        />
                      </td>
                      <td data-label="" className="admin-actions-cell">
                        <button className="admin-edit" onClick={() => setEditProizvod(p)}>Izmeni</button>
                        <button
                          className="admin-delete"
                          onClick={() => setProizvodZaBrisanje(p)}
                        >
                          Obriši
                        </button>
                      </td>
                    </SortableItem>

                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </>
      )}
      {previewSlika && (
        <div className="slika-preview-overlay" onClick={() => setPreviewSlika(null)}>
          <div className="slika-preview-box" onClick={(e) => e.stopPropagation()}>
            <img src={previewSlika} alt="Pregled" />
            <button onClick={() => setPreviewSlika(null)}>Zatvori</button>
          </div>
        </div>
      )}


      <ToastContainer />
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

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>
              Dodaj novi proizvod u kategoriju:{" "}
              <span style={{ fontStyle: "italic" }}>{aktivnaKategorija?.naziv}</span>
            </h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input
                type="text"
                name="naziv"
                placeholder="Naziv proizvoda"
                value={novProizvod.naziv}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="opis"
                placeholder="Opis proizvoda"
                value={novProizvod.opis}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  marginBottom: "15px",
                }}
              />
              <input
                type="number"
                name="cena"
                placeholder="Cena (RSD)"
                value={novProizvod.cena}
                onChange={handleInputChange}
                required
              />
              <input
                type="file"
                name="slika"
                accept="image/*"
                onChange={(e) => setSlikaFile(e.target.files[0])}
              />

              <div className="admin-modal-actions">
                <button type="submit" className="buttonSave">
                  Sačuvaj
                </button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editProizvod && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Izmeni proizvod</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData();
                formData.append("naziv", editProizvod.naziv);
                formData.append("opis", editProizvod.opis);
                formData.append("cena", editProizvod.cena);
                if (slikaFile) formData.append("slika", slikaFile);

                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products/${editProizvod._id}`, {
                  method: "PUT",
                  body: formData,
                })
                  .then((res) => res.json())
                  .then((updated) => {
                    setProizvodi((prev) =>
                      prev.map((p) => (p._id === updated._id ? updated : p))
                    );
                    toast.success("Proizvod izmenjen!");
                    setEditProizvod(null);
                    setSlikaFile(null);
                  })
                  .catch(() => toast.error("Greška pri izmeni"));
              }}
              encType="multipart/form-data"
            >
              <input
                type="text"
                name="naziv"
                value={editProizvod.naziv}
                onChange={(e) =>
                  setEditProizvod((prev) => ({ ...prev, naziv: e.target.value }))
                }
                placeholder="Naziv"
                required
              />
              <textarea
                name="opis"
                value={editProizvod.opis}
                onChange={(e) =>
                  setEditProizvod((prev) => ({ ...prev, opis: e.target.value }))
                }
                rows={3}
              />
              <input
                type="number"
                name="cena"
                value={editProizvod.cena}
                onChange={(e) =>
                  setEditProizvod((prev) => ({ ...prev, cena: e.target.value }))
                }
                placeholder="Cena"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSlikaFile(e.target.files[0])}
              />

              <div className="admin-modal-actions">
                <button type="submit" className="buttonSave">
                  Sačuvaj izmene
                </button>
                <button type="button" onClick={() => setEditProizvod(null)}>
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {proizvodZaBrisanje && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Da li ste sigurni da želite da obrišete proizvod?</h3>
            <div className="admin-modal-actions">
              <button onClick={potvrdiBrisanjeProizvoda} className="admin-delete">
                Obriši
              </button>
              <button onClick={() => setProizvodZaBrisanje(null)}>
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

export default AdminProizvodi;
