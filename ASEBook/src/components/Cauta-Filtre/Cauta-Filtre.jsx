import React, { useState } from "react";
import "./Cauta-Filtre.css";
import text from '../../utils/text.js';

const CautaFiltre = ({ genuriSelectate, setGenuriSelectate, pretMinim, setPretMinim, pretMaxim, setPretMaxim }) => {
    const [showGenuri, setShowGenuri] = useState(false);
    const genuriLiterare = text.genuriLiterare;

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
            </div>
        </div>
    );
};

export default CautaFiltre;
