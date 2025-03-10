import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState'; 
import "../styles/Bazar.css";
import textData from "../utils/text.js";

const Bazar = () => {
    const [pretMinim, setPretMinim] = useState(0);
    const [pretMaxim, setPretMaxim] = useState(9999);
    const [stringCautare, setStringCautare] = useState("");

    const navigate = useNavigate();
    const {authData} = useContext(GlobalContext);

    const [categorieSelectata, setCategorieSelectata] = useState("Alege categoria");
    const [sortareSelectata, setSortareSelectata] = useState("Sorteaza dupa");
    const [dropdownCategorie, setDropdownCategorie] = useState(false);
    const [dropdownSortare, setDropdownSortare] = useState(false);

    const genuriLiterare = textData.genuriLiterare;

    const selectCategorie = (categorie) => {
        setCategorieSelectata(categorie);
        setDropdownCategorie(false);
    };

    const selectSortare = (sortare) => {
        setSortareSelectata(sortare);
        setDropdownSortare(false);
    };

    const handlePretMinimChange = (e) => {
        let value = e.target.value;
        if (value === "" || /^[0-9]+$/.test(value)) {
            setPretMinim(value < 0 ? 0 : value);
        }
    };

    const handlePretMaximChange = (e) => {
        let value = e.target.value;
        if (value === "" || /^[0-9]+$/.test(value)) {
            setPretMaxim(value < 0 ? 0 : value); 
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) {
            e.preventDefault();
        }
    };

    return (
        <div className='bazar-container'>

            {authData.token && <div className='connected-menu'>
                <button className='btn-creaza-anunt' onClick={() => {navigate('/bazar/creeaza-anunt')}}>Publica un anunt</button>
                <button className='btn-vezi-anunturi'>Vezi anunturile tale</button>
                <button className='btn-conversatii'>Vezi conversatiile</button>
                </div>}


            <div className='searchbar-container'>
                <input className='searchbar-anunturi' type='text' placeholder='Incepeti cautarea' value={stringCautare} onChange={(e) => setStringCautare(e.target.value)} />
                <button className='btn-cauta'>Cauta</button>
            </div>
            <div className='filtre-container'>
                <div className='p-filtre-container'>
                    <h2>Filtre:</h2>

                </div>
                <div className='actual-filters'>
                <div className='categorii-container'>
                    <p>Categorie:</p>
                    <div className='dropdown-container'>
                        <button className='categorii-dropdown' onClick={() => setDropdownCategorie(!dropdownCategorie)}>
                            {categorieSelectata} <i className='fa fa-caret-down' />
                        </button>
                        {dropdownCategorie && (
                            <div className='categorii-content'>
                                <table>
                                    <tbody>
                                        {genuriLiterare.map((gen, index) => (
                                            <tr key={index} onClick={() => selectCategorie(gen)}>
                                                <td>{gen}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                    <div className='pret-container'>
                        <div className='p-pret-container'>
                            <p>Pret:</p>
                        </div>
                        <div className='input-pret-container'>
                            <input 
                                type='text' 
                                className='input-pret' 
                                value={pretMinim} 
                                onChange={handlePretMinimChange} 
                                onInput={handleInputChange}
                                placeholder='Pret minim' 
                            />
                            <p>-</p>
                            <input 
                                type='text' 
                                className='input-pret' 
                                value={pretMaxim} 
                                onChange={handlePretMaximChange} 
                                onInput={handleInputChange}
                                placeholder='Pret maxim' 
                            />
                        </div>
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
                                            <tr onClick={() => selectSortare("Pret - descrescator")}><td>Pret - descrescator</td></tr>
                                            <tr onClick={() => selectSortare("Pret - crescator")}><td>Pret - crescator</td></tr>
                                            <tr onClick={() => selectSortare("Cele mai vechi anunturi")}><td>Cele mai vechi anunturi</td></tr>
                                            <tr onClick={() => selectSortare("Cele mai noi anunturi")}><td>Cele mai noi anunturi</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
            </div>
            <div className='tabel-container'>
                {/* Aici vor fi listate anunțurile */}
            </div>
        </div>
    );
}

export default Bazar;
