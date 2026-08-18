import React, { useState, useEffect } from "react";
import "./admin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch, apiUrl } from "../api";

function AdminLogo() {
    const [trenutniLogo, setTrenutniLogo] = useState(null);
    const [novaSlika, setNovaSlika] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        apiFetch("/api/logo")
            .then((res) => res.json())
            .then((data) => {
                if (data.logo) {
                    setTrenutniLogo(apiUrl(data.logo));
                }
            })
            .catch((err) => {
                console.error("Greška pri učitavanju loga:", err);
                toast.error("Greška pri učitavanju loga.");
            });
    }, []);

    const handlePromeni = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNovaSlika(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = () => {
        if (!novaSlika) return;

        const formData = new FormData();
        formData.append("logo", novaSlika);

        apiFetch("/api/logo", {
            method: "PUT",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                toast.success("Logo uspešno izmenjen!");
                setTrenutniLogo(
                    `${apiUrl(data.logo)}?t=${Date.now()}`
                );

                setNovaSlika(null);
                setPreview(null);
            })
            .catch((err) => {
                console.error("Greška pri uploadu:", err);
                toast.error("Greška pri izmeni loga.");
            });
    };

    return (
        <div className="admin-logo-page">
            <h2>Logo Podešavanja</h2>

            <p>Trenutna logo slika:</p>
            {trenutniLogo ? (
                <img
                    src={trenutniLogo}
                    alt="Trenutni logo"
                    className="admin-logo-preview"
                />
            ) : (
                <p style={{ color: "#888" }}>Logo nije postavljen</p>
            )}

            <div style={{ marginTop: "20px" }}>
                <label htmlFor="logoInput" className="admin-button">
                    Promeni logo
                </label>
                <input
                    type="file"
                    id="logoInput"
                    accept="image/*"
                    onChange={handlePromeni}
                    style={{ display: "none" }}
                />
            </div>

            {preview && (
                <div className="admin-logo-preview-box">
                    <p>Pregled nove slike:</p>
                    <div className="admin-logo-row">
                        <img src={preview} alt="Novi logo" className="admin-logo-preview" />
                        <button className="buttonSave" onClick={handleUpload}>
                            Sačuvaj novi logo
                        </button>
                    </div>
                </div>
            )}


            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default AdminLogo;
