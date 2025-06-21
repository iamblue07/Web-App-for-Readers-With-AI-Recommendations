import React, { useState, useEffect, useContext } from "react";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import stock_book from "../assets/stock_book.jpg";
import config from "../utils/config";
import { createToast } from "../utils/createToast";
import "../styles/CreeazaAnunt.css";
import text from "../utils/text";
import HeaderBazar from "../components/HeaderBazar/HeaderBazar";

const CreeazaAnunt = () => {
    const genuriLiterare = text.genuriLiterare;
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

    const [hasRights, setHasRights] = useState(false);
    const [canSubmit, setCanSubmit] = useState(true);
    const [validationError, setValidationError] = useState("");

    const [genLiterar, setGenLiterar] = useState("Selecteaza genul literar");
    const [dropdownGen, setDropdownGen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const itemsPerPage = 15;

    useEffect(() => {
        if (!authData) {
            navigate('/bazar');
        } else {
            fetchUserRights();
        }
    }, [authData, navigate]);

    const fetchBooksShort = async (page = 1) => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/fetchBooksShort`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    keywords: cautareBD,
                    page: page,
                    pageSize: itemsPerPage
                })
            });
            if (!response.ok) {
                console.log("Error fetching data!");
                return;
            }
            const data = await response.json();
            setRezultateBD(Array.isArray(data.books) ? data.books : []);
            setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
            setTotalResults(data.totalCount);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCautaClick = () => {
        setCurrentPage(1);
        fetchBooksShort(1);
    };

    const handleCarteClick = (carteId) => {
        setStoredId(carteId);
        setViewRezultate(false);
    };

    const handleCautaDinNou = () => {
        setStoredId(null);
        setCautareBD("");
        setRezultateBD([]);
    };

    const handlePretChange = (e) => {
        let value = e.target.value;
        if (value === "" || /^[0-9]+$/.test(value)) {
            setPret(value < 0 ? 0 : value);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchBooksShort(newPage);
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

    const fetchUserRights = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/getAnuntRights`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                console.log("Eroare la verificarea drepturilor!");
                return;
            }
            const data = await response.json();
            if (!data) {
                console.log("Eroare la verificarea drepturilor!");
                return;
            }
            setHasRights(data.hasRights);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchCreateAnunt = async () => {
        // Validate required fields
        if (!titlu || !descriere || !pret || (image === stock_book) || (genLiterar === "Selecteaza genul literar")) {
            setValidationError("Titlul, imaginea, descrierea, genul literar si pretul sunt obligatorii!");
            return;
        }

        // Clear validation error if fields are valid
        setValidationError("");

        try {
            if (!hasRights) {
                createToast("Nu aveti drepturile de a crea anunt! Contactati un administrator!", false);
                return;
            }
            setCanSubmit(false);

            const formData = new FormData();
            formData.append("anuntTitle", titlu);
            formData.append("anuntDescriere", descriere);
            formData.append("anuntData", new Date().toISOString());
            formData.append("anuntPret", pret);
            formData.append("anuntNegociabil", esteNegociabil);
            formData.append("anuntIdCarte", storedId);
            formData.append("genLiterar", genLiterar);

            // Append the image file
            const fileInput = document.getElementById("fileInput");
            if (fileInput.files[0]) {
                formData.append("bookImage", fileInput.files[0]);
            }

            const response = await fetch(`${config.API_URL}/api/bazar/createAnunt`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authData.token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                createToast("Eroare la crearea anuntului!", false);
                setCanSubmit(true);
                return;
            }

            createToast("Anuntul a fost creat cu succes!", true);
            setTimeout(() => {
                navigate('/bazar');
            }, 3000);
        } catch (error) {
            console.log(error);
            setCanSubmit(true);
        }
    };

    

    return (
    <>
        <HeaderBazar/>
        <div className="CreeazaAnunt-Container">
            <ToastContainer />
            <div className="CreeazaAnunt-container-left">
                <div className="CreeazaAnunt-container-titlu">
                    <p>Introdu titlul anuntului:</p>
                    <input
                        type="text"
                        placeholder="Introdu titlul"
                        value={titlu}
                        onChange={(e) => setTitlu(e.target.value)}
                        className="CreeazaAnunt-input"
                    />
                </div>
                <div className="CreeazaAnunt-container-descriere">
                    <p>Descrierea anuntului:</p>
                    <textarea
                        placeholder="Introdu Descrierea"
                        value={descriere}
                        onChange={(e) => setDescriere(e.target.value)}
                        className="CreeazaAnunt-textarea"
                    />
                </div>

                <div className="CreeazaAnunt-container-genLiterar">
                    <div className="p-genLiterar-container">
                        <p className="p-genLiterar">Gen literar:</p>
                        <div className="genLiterar-dropdown-container">
                            <button className="genuri-dropdown" onClick={() => setDropdownGen(!dropdownGen)}>
                                {genLiterar} <i className="fa fa-caret-down" />
                            </button>
                            {dropdownGen && (
                                <div className="genuri-content">
                                    <table>
                                        <tbody>
                                            {genuriLiterare.map((gen, index) => (
                                                <tr key = {index} onClick={() => {setGenLiterar(gen); setDropdownGen(!dropdownGen)}}>
                                                    <td>{gen}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="CreeazaAnunt-container-pret">
                    <p>Pret:</p>
                    <input
                        type="text"
                        placeholder="Introdu pretul"
                        value={pret}
                        onInput={handleInputChange}
                        onChange={handlePretChange}
                        className="CreeazaAnunt-input"
                    />
                </div>
                {validationError && <p style={{ color: "red" }}>{validationError}</p>}
                
                {esteNegociabil ? (
                    <button className="CreeazaAnunt-btn-negociabil-da" onClick={() => setEsteNegociabil(!esteNegociabil)}>
                        Negociabil
                    </button>
                ) : (
                    <button className="CreeazaAnunt-btn-negociabil-nu" onClick={() => setEsteNegociabil(!esteNegociabil)}>
                        Nu e negociabil
                    </button>
                )}
                <button className="CreeazaAnunt-btn-publica" disabled={!canSubmit} onClick={fetchCreateAnunt}>
                    Publica anuntul!
                </button>
                <button className="CreeazaAnunt-btn-anuleaza" onClick={() => navigate('/bazar')}>
                    Anuleaza
                </button>
            </div>
            <div className="CreeazaAnunt-container-right">
                <div className="CreeazaAnunt-container-imagine">
                    <p>Incarca o imagine!</p>
                    <img src={image} alt="imagine-carte" className="CreeazaAnunt-imagine-profil" />
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={uploadImage}
                        className="CreeazaAnunt-file-input"
                    />
                    <button className="CreeazaAnunt-buton-Incarca" onClick={() => document.getElementById("fileInput").click()}>
                        Incarca
                    </button>
                    {image !== stock_book && (
                        <button className="CreeazaAnunt-btn-Sterge" onClick={() => setImage(stock_book)}>
                            Sterge imaginea
                        </button>
                    )}
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
                                    onChange={(e) => setCautareBD(e.target.value)}
                                    className="CreeazaAnunt-input-cauta"
                                />
                                <button onClick={handleCautaClick} className="CreeazaAnunt-btn-cauta">
                                    Cauta
                                </button>
                            </div>
                            {viewRezultate && (
                                Array.isArray(rezultateBD) && rezultateBD.length > 0 ? (
                                    <>
                                        <div className="CreeazaAnunt-rezultate-container">
                                            {rezultateBD.map((carte) => (
                                                <div key={carte.idCarte} className="CreeazaAnunt-rezultat-card" onClick={() => handleCarteClick(carte.idCarte)}>
                                                    <h4>{carte.titlu}</h4>
                                                    <p><strong>Autor:</strong> {carte.autor}</p>
                                                    <p><strong>Gen:</strong> {carte.gen}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pagination-controls">
                                            <button 
                                                className="pagination-btn" 
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                &lt;
                                            </button>
                                            
                                            <span className="pagination-info">
                                                Pagina {currentPage} din {totalPages}
                                            </span>
                                            
                                            <button 
                                                className="pagination-btn" 
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                &gt;
                                            </button>
                                            
                                            <div className="pagination-total">
                                                Total rezultate: {totalResults}
                                            </div>
                                        </div>
                                    </>
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
                            <button onClick={handleCautaDinNou} className="CreeazaAnunt-btn-cauta">
                                Cauta din nou
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>
    );
};

export default CreeazaAnunt;