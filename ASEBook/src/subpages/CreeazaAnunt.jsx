import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import stock_book from "../assets/stock_book.jpg";
import config from "../utils/config";

import "../styles/CreeazaAnunt.css";

const CreeazaAnunt = () => {
    const { authData } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [esteNegociabil, setEsteNegociabil] = useState(true);
    const [titlu, setTitlu] = useState("");
    const [descriere, setDescriere] = useState("");
    const [pret, setPret] = useState(0);
    const [image, setImage] = useState(stock_book);

    const [cautareBD, setCautareBD] = useState("");
    const [rezultateBD, setRezultateBD] = useState([]);
    const [viewRezultate, setViewRezultate] = useState(false);
    const [storedId, setStoredId] = useState(null);

    useEffect(() => {
        if (!authData) {
            navigate('/bazar');
        }
    }, [authData, navigate]);

    const fetchBooksShort = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/fetchBooksShort`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keywords: cautareBD })
            });
            if (!response.ok) {
                console.log("Error fetching data!");
                return;
            }
            const data = await response.json();
            setRezultateBD(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCautaClick = () => {
        fetchBooksShort(); // Apelăm funcția de fetch atunci când apesi pe buton
    };

    const handleCarteClick = (carteId) => {
        setStoredId(carteId); // Stocăm ID-ul cărții selectate
        setViewRezultate(false); // Ascundem rezultatele
    };

    const handleCautaDinNou = () => {
        setStoredId(null); // Resetăm storedId
        setCautareBD(""); // Resetăm search bar-ul
        setRezultateBD([]); // Resetăm rezultatele
    };

    const handlePretChange = (e) => {
        let value = e.target.value;
        if (value === "" || /^[0-9]+$/.test(value)) {
            setPret(value < 0 ? 0 : value);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) {
            e.preventDefault();
        }
    };

    const uploadImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(URL.createObjectURL(file));
    };

    return (
        <div className="CreeazaAnunt-Container">
            <div className="CreeazaAnunt-container-left">
                <div className="CreeazaAnunt-container-titlu">
                    <p>Introdu titlul anuntului:</p>
                    <input type="text" placeholder="Introdu titlul" value={titlu} onChange={(e) => { setTitlu(e.target.value) }} className="CreeazaAnunt-input" />
                </div>
                <div className="CreeazaAnunt-container-descriere">
                    <p>Descrierea anuntului:</p>
                    <textarea placeholder="Introdu Descrierea" value={descriere} onChange={(e) => { setDescriere(e.target.value) }} className="CreeazaAnunt-textarea" />
                </div>
                <div className="CreeazaAnunt-container-pret">
                    <p>Pret:</p>
                    <input type="text" placeholder="Introdu pretul" value={pret} onInput={handleInputChange} onChange={handlePretChange} className="CreeazaAnunt-input" />
                </div>
                <button className="CreeazaAnunt-btn-negociabil" onClick={() => { setEsteNegociabil(!esteNegociabil) }}>
                    {esteNegociabil ? "Negociabil" : "Nu e negociabil"}
                </button>
                <button className="CreeazaAnunt-btn-publica">
                    Publica anuntul!
                </button>
                <button className="CreeazaAnunt-btn-anuleaza">
                    Anuleaza
                </button>
            </div>
            <div className="CreeazaAnunt-container-right">
                <div className="CreeazaAnunt-container-imagine">
                    <p>Incarca o imagine!</p>
                    <img src={image} alt="imagine-carte" className="CreeazaAnunt-imagine-profil" />
                    <input type="file" id="fileInput" accept="image/*" style={{ display: "none" }} onChange={uploadImage} className="CreeazaAnunt-file-input"/>
                    <button className="CreeazaAnunt-buton-Incarca" onClick={() => document.getElementById("fileInput").click()}>
                        Incarca
                    </button>
                    {image !== stock_book && (<button className="CreeazaAnunt-btn-Sterge" onClick={() => { setImage(stock_book) }}>Sterge imaginea</button>)}
                </div>
                <div className="CreeazaAnunt-container-cauta">
                    <p>Este disponibila in magazinele deja-existente?</p>
                    {storedId === null ? (
                        <div className="CreeazaAnunt-dropdown-rezultate">
                            <div className="input-buton-container">
                                <input
                                    type="text"
                                    placeholder="Caută în baza de date"
                                    value={cautareBD}
                                    onFocus={() => setViewRezultate(true)}
                                    onChange={(e) => { setCautareBD(e.target.value); }}
                                    className="CreeazaAnunt-input-cauta"
                                />
                                <button onClick={handleCautaClick} className="CreeazaAnunt-btn-cauta">Cauta</button>
                            </div>
                            {viewRezultate && (
                                Array.isArray(rezultateBD) && rezultateBD.length > 0 ? (
                                    rezultateBD.map((carte) => (
                                        <div key={carte.idCarte} className="CreeazaAnunt-rezultat-card" onClick={() => handleCarteClick(carte.idCarte)}>
                                            <h4>{carte.titlu}</h4>
                                            <p><strong>Autor:</strong> {carte.autor}</p>
                                            <p><strong>Gen:</strong> {carte.gen}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>Nu s-au gasit rezultate.</p>
                                )
                            )}
                        </div>
                    ) : (
                        <div>
                            <p>Carte selectata:</p>
                            <div className="CreeazaAnunt-rezultat-card">
                                {rezultateBD.filter(carte => carte.idCarte === storedId).map((carte) => (
                                    <div key={carte.idCarte}>
                                        <h4>{carte.titlu}</h4>
                                        <p><strong>Autor:</strong> {carte.autor}</p>
                                        <p><strong>Gen:</strong> {carte.gen}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleCautaDinNou} className="CreeazaAnunt-btn-cauta">Cauta din nou</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreeazaAnunt;
