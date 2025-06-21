import React, { useState, useContext } from "react";
import "./Cauta-Filtre.css";
import text from '../../utils/text.js';
import MeniuRecomandariAI from "../MeniuRecomandariAI/MeniuRecomandariAI.jsx";
import { GlobalContext } from "../../context/GlobalState.jsx";
const CautaFiltre = ({ genuriSelectate, setGenuriSelectate, pretMinim, setPretMinim, pretMaxim, setPretMaxim, sortareSelectata, setSortareSelectata, setBookIds, setTotalPages }) => {
    const [showGenuri, setShowGenuri] = useState(false);
    const genuriLiterare = text.genuriLiterare;

    const {authData} = useContext(GlobalContext)

    const toggleGen = (gen) => {
        setGenuriSelectate((prev) => prev.includes(gen) ? prev.filter(g => g !== gen) : [...prev, gen]);
    };

    const handlePretChange = (setter) => (e) => {
        let value = e.target.value.replace(/\D/g, "");
        setter(value === "" ? "" : parseInt(value, 10));
    };

    const handleKeyDown = (e) => {
        if (["-", "e", "+", "."].includes(e.key)) {
            e.preventDefault();
        }
    };

    const [dropdownSortare, setDropdownSortare] = useState(false);
    
    const selectSortare = (sortare) => {
        setSortareSelectata(sortare);
        setDropdownSortare(false);
    };

    const [viewAIMenu, setViewAIMenu] = useState(false);

    return (
        <div className="cauta-filtre-container">
            <h2>Filtre</h2>
            <div className="filtru-gen">
                <div className="gen-header" onClick={() => setShowGenuri(!showGenuri)}>
                    <span>Gen Literar</span>
                    <span className={`sageta ${showGenuri ? "rotated" : ""}`}>&#9660;</span>
                </div>
                {showGenuri && (
                    <div className="genuri-container">
                        <table className="genuri-tabel">
                            <tbody>
                                {genuriLiterare.map((gen, index) => (
                                    <tr key={index}>
                                        <td>{gen}</td>
                                        <td>
                                            <span 
                                                className={`gen-select ${genuriSelectate.includes(gen) ? "selectat" : ""}`}
                                                onClick={() => toggleGen(gen)}
                                            >
                                                {genuriSelectate.includes(gen) ? "✅" : "❌"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Preț */}
            <div className="filtru-pret">
                <label>Pret:</label>
                <div className="pret-inputs">
                    <input 
                        type="text" 
                        inputMode="numeric"
                        value={pretMinim}
                        onChange={handlePretChange(setPretMinim)}
                        onKeyDown={handleKeyDown}
                        placeholder="Min"
                    />
                    <span>-</span>
                    <input 
                        type="text" 
                        inputMode="numeric"
                        value={pretMaxim}
                        onChange={handlePretChange(setPretMaxim)}
                        onKeyDown={handleKeyDown}
                        placeholder="Max"
                    />
                </div>
                <div className='sortare-container'>
                        <p>Sorteaza dupa:</p>
                        <div className='dropdown-container'>
                            <button className='sortari-dropdown' onClick={() => setDropdownSortare(!dropdownSortare)}>
                                {sortareSelectata} <i className='fa fa-caret-down' />
                            </button>
                            {dropdownSortare && (
                                <div className='sortari-content'>
                                    <table>
                                        <tbody>
                                            <tr onClick={() => selectSortare("Sorteaza dupa")}><td>Sorteaza dupa</td></tr>
                                            <tr onClick={() => selectSortare("Pret - crescator")}><td>Pret - crescator</td></tr>
                                            <tr onClick={() => selectSortare("Pret - descrescator")}><td>Pret - descrescator</td></tr>
                                            <tr onClick={() => selectSortare("Alfabetic - crescator")}><td>Alfabetic - crescator</td></tr>
                                            <tr onClick={() => selectSortare("Alfabetic - descrescator")}><td>Alfabetic - descrescator</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                </div>
                {authData.token && (
                    <div className="recomandari-container">
                        <div className="dropdown-wrapper">
                            <div className="div-view-AI" onClick={() => setViewAIMenu(!viewAIMenu)}>
                                <div className="info-bubble">
                                    <div className="info-tooltip">
                                        Acest recomandator AI clasifica cartile in functie de emotiile transmise de descrierea lor si 
                                        analizeaza cuvintele cheie introduse cu descrierile cartilor pentru a genera recomandari inteligente.
                                        Procesul poate dura cateva secunde, va rugam aveti rabdare!
                                    </div>
                                </div>
                                <span>Recomandari AI</span>
                                <span className={`sageta ${viewAIMenu ? "rotated" : ""}`}>&#9660;</span>
                            </div>
                            {viewAIMenu && (
                                <div className="dropdown-menu">
                                    <MeniuRecomandariAI 
                                        setBookIds={setBookIds}
                                        setTotalPages={setTotalPages}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default CautaFiltre;
