import React, { useState, useEffect } from "react";
import "./admin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSort } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { FiList } from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem"; // Napravićemo ovaj komponent posebno

function Kategorije() {
  const sensors = useSensors(useSensor(PointerSensor));
  const [kategorije, setKategorije] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [novaKategorija, setNovaKategorija] = useState({ naziv: "" });
  const [slikaFile, setSlikaFile] = useState(null);
  const [kategorijaZaBrisanje, setKategorijaZaBrisanje] = useState(null);
  const [kategorijaZaIzmenu, setKategorijaZaIzmenu] = useState(null);
  const [novaSlikaZaIzmenu, setNovaSlikaZaIzmenu] = useState(null);
  const [previewSlika, setPreviewSlika] = useState(null);
  const [urediRaspored, setUrediRaspored] = useState(false);
  const [reorderedKategorije, setReorderedKategorije] = useState([]);
  const zaSlanje = reorderedKategorije.length
    ? reorderedKategorije
    : kategorije;

  useEffect(() => {
    console.log(
      "URL:",
      `https://restaurant-menu-app-nzfr.onrender.com/api/categories`
    );
    fetch("https://restaurant-menu-app-nzfr.onrender.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const sortirano = data.sort((a, b) => a.redniBroj - b.redniBroj);
        setKategorije(sortirano);
      })

      .catch((err) => {
        console.error("Greška fetch:", err);
        console.log(
          "Fetchujem sa:",
          "https://restaurant-menu-app-nzfr.onrender.com"
        );
        toast.error("Greška pri učitavanju kategorija");
      });
  }, []);

  const handleInputChange = (e) => {
    setNovaKategorija({ ...novaKategorija, [e.target.name]: e.target.value });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const currentList = reorderedKategorije.length
        ? reorderedKategorije
        : kategorije;

      const oldIndex = currentList.findIndex((item) => item._id === active.id);
      const newIndex = currentList.findIndex((item) => item._id === over.id);

      const newOrder = arrayMove(currentList, oldIndex, newIndex);
      setReorderedKategorije(newOrder);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("naziv", novaKategorija.naziv);
    if (slikaFile) {
      formData.append("slika", slikaFile);
    }

    fetch("https://restaurant-menu-app-nzfr.onrender.com/api/categories", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        const novaKat = {
          ...data,
          naziv: data.naziv || "(bez naziva)",
          slika: data.slika || "",
        };
        setKategorije([...kategorije, novaKat]);
        setShowModal(false);
        setNovaKategorija({ naziv: "" });
        setSlikaFile(null);
        toast.success("Kategorija uspešno dodata!");
      })
      .catch((err) => {
        console.error("Greška:", err);
        toast.error("Greška pri dodavanju kategorije.");
      });
  };

  const potvrdiBrisanje = () => {
    fetch(
      `https://restaurant-menu-app-nzfr.onrender.com/api/categories/${kategorijaZaBrisanje._id}`,
      {
        method: "DELETE",
      }
    )
      .then((res) => res.json())
      .then(() => {
        setKategorije(
          kategorije.filter((kat) => kat._id !== kategorijaZaBrisanje._id)
        );
        setKategorijaZaBrisanje(null);
        toast.success("Kategorija uspešno obrisana.");
      })
      .catch((err) => {
        console.error("Greška:", err);
        toast.error("Greška pri brisanju kategorije.");
      });
  };

  const potvrdiIzmenu = () => {
    const formData = new FormData();
    formData.append("naziv", kategorijaZaIzmenu.naziv);
    if (novaSlikaZaIzmenu) {
      formData.append("slika", novaSlikaZaIzmenu);
    }

    fetch(
      `https://restaurant-menu-app-nzfr.onrender.com/api/categories/${kategorijaZaIzmenu._id}`,
      {
        method: "PUT",
        body: formData,
      }
    )
      .then((res) => res.json())
      .then((updated) => {
        setKategorije((prev) =>
          prev.map((kat) => (kat._id === updated._id ? updated : kat))
        );
        setKategorijaZaIzmenu(null);
        setNovaSlikaZaIzmenu(null);
        toast.success("Kategorija uspešno izmenjena!");
        localStorage.setItem("refreshHomeKategorije", "true");
      })
      .catch((err) => {
        console.error("Greška pri izmeni:", err);
        toast.error("Greška pri izmeni kategorije.");
      });
  };

  return (
    <div>
      <h2>Kategorije</h2>

      {/* Dugmad za dodavanje i izmenu rasporeda kategorija*/}
      <div className="admin-button-group">
        <button className="admin-add-btn" onClick={() => setShowModal(true)}>
          <FiPlus style={{ marginRight: "8px" }} /> Dodaj kategoriju
        </button>

        <button
          className="admin-reorder-btn"
          onClick={() => {
            if (urediRaspored) {
              const nizZaSlanje = reorderedKategorije.length
                ? reorderedKategorije
                : kategorije;
              console.log(
                "📤 Šaljem raspored:",
                nizZaSlanje.map((kat, i) => ({
                  _id: kat._id,
                  redniBroj: i,
                }))
              );

              fetch(
                `https://restaurant-menu-app-nzfr.onrender.com/api/categories/reorder`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    kategorije: nizZaSlanje.map((kat, index) => ({
                      _id: kat._id,
                      redniBroj: index,
                    })),
                  }),
                }
              )
                .then((res) => res.json())
                .then(() => {
                  toast.success("Raspored uspešno sačuvan!");
                  setKategorije(nizZaSlanje); // ažuriramo prikaz
                  setReorderedKategorije([]);
                })
                .catch(() => toast.error("Greška pri čuvanju rasporeda"));
            }

            setUrediRaspored(!urediRaspored);
          }}
        >
          <FaSort style={{ marginRight: "8px" }} />
          {urediRaspored ? "Sačuvaj raspored i izađi" : "Promeni raspored"}
        </button>
      </div>

      <p className="admin-count">
        <FiList style={{ marginRight: "8px", fontSize: "22px" }} />
        Ukupno kategorija: {reorderedKategorije.length || kategorije.length}
      </p>

      {/* Tabela sa kategorijama */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Slika</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={(reorderedKategorije.length
              ? reorderedKategorije
              : kategorije
            ).map((k) => k._id)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {(reorderedKategorije.length
                ? reorderedKategorije
                : kategorije
              ).map((kat, index) => (
                <SortableItem
                  key={kat._id}
                  kat={kat}
                  index={index}
                  urediRaspored={urediRaspored}
                >
                  <td>{kat.naziv || "(bez naziva)"}</td>
                  <td>
                    {kat.slika ? (
                      <img
                        src={
                          kat.slika.startsWith("/uploads/")
                            ? `https://restaurant-menu-app-nzfr.onrender.com${kat.slika}`
                            : kat.slika
                        }
                        alt={kat.naziv}
                        width="60"
                        className="admin-thumb"
                        onClick={() => setPreviewSlika(kat.slika)}
                        style={{ cursor: "pointer", borderRadius: "6px" }}
                      />
                    ) : (
                      <span style={{ color: "#888" }}>Nema slike</span>
                    )}
                  </td>
                  <td className="admin-actions-cell">
                    <button
                      className="admin-edit"
                      onClick={() => setKategorijaZaIzmenu(kat)}
                    >
                      Izmeni
                    </button>
                    <button
                      className="admin-delete"
                      onClick={() => setKategorijaZaBrisanje(kat)}
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

      {/* Modal za dodavanje nove kategorije */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Dodaj novu kategoriju</h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input
                type="text"
                name="naziv"
                placeholder="Naziv kategorije"
                value={novaKategorija.naziv}
                onChange={handleInputChange}
                required
              />
              <input
                type="file"
                name="slika"
                accept="image/*"
                onChange={(e) => setSlikaFile(e.target.files[0])}
                required
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

      {/* Modal za potvrdu brisanja */}
      {kategorijaZaBrisanje && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Da li ste sigurni da želite da obrišete kategoriju?</h3>
            <div className="admin-modal-actions">
              <button onClick={potvrdiBrisanje} className="admin-delete">
                Izbriši
              </button>
              <button onClick={() => setKategorijaZaBrisanje(null)}>
                Izađi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal za izmenu kategorije */}
      {kategorijaZaIzmenu && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Izmeni kategoriju</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                potvrdiIzmenu();
              }}
              encType="multipart/form-data"
            >
              <input
                type="text"
                name="naziv"
                value={kategorijaZaIzmenu.naziv}
                onChange={(e) =>
                  setKategorijaZaIzmenu({
                    ...kategorijaZaIzmenu,
                    naziv: e.target.value,
                  })
                }
                required
              />
              <input
                type="file"
                accept="image/*"
                name="slika"
                onChange={(e) => setNovaSlikaZaIzmenu(e.target.files[0])}
              />
              <div className="admin-modal-actions">
                <button type="submit" className="admin-edit">
                  Sačuvaj izmene
                </button>
                <button
                  type="button"
                  onClick={() => setKategorijaZaIzmenu(null)}
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast container za prikaz notifikacija */}
      <ToastContainer position="top-right" autoClose={3000} />
      {previewSlika && (
        <div
          className="slika-preview-overlay"
          onClick={() => setPreviewSlika(null)}
        >
          <div
            className="slika-preview-box"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewSlika} alt="Pregled" />
            <button onClick={() => setPreviewSlika(null)}>Zatvori</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kategorije;
