import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState'; 
import "../styles/Bazar.css";
import textData from "../utils/text.js";
import config from "../utils/config.js";
import Anunt from '../components/Anunt/Anunt.jsx';
import HeaderBazar from '../components/HeaderBazar/HeaderBazar.jsx';

const Bazar = () => {
    const [pretMinim, setPretMinim] = useState(0);
    const [pretMaxim, setPretMaxim] = useState(9999);
    const [stringCautare, setStringCautare] = useState("");
    const [categorieSelectata, setCategorieSelectata] = useState("Alege categoria");
    const [sortareSelectata, setSortareSelectata] = useState("Sorteaza dupa");

    const [dropdownCategorie, setDropdownCategorie] = useState(false);
    const [dropdownSortare, setDropdownSortare] = useState(false);

    const genuriLiterare = [...textData.genuriLiterare];
    genuriLiterare.unshift("Alege categoria");

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


    const [anunturiPerPage, setAnunturiPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [anuntBazarIDs, setAnuntBazarIDs] = useState([]);

    const [anunturiDetails, setAnunturiDetails] = useState([]);

    const fetchAnuntBazarIDs = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/getAnuntIDs`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({stringCautare, pretMinim, pretMaxim, categorieSelectata, sortareSelectata, currentPage, anunturiPerPage })
            });
            if (!response.ok) {
                console.log('Eroare la preluarea datelor');
                return;
            }
            const data = await response.json();
            setAnuntBazarIDs(data.ids);
            setTotalPages(data.totalPages);
        } catch(error) {
            console.log(error);
        }
    }

    const fetchAnuntBazarData = async (ids) => {
        if(ids.length === 0) return;
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/getAnunturiData`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ids})
            });
            if(!response.ok) {
                console.log("Eroare la preluarea detaliilor!");
                return;
            }
            const data = await response.json();
            setAnunturiDetails(data);
        }catch(error){
            console.error("Error fetching anunturi details: ", error);
        }
    }

    useEffect(() => {
        fetchAnuntBazarData(anuntBazarIDs);
    }, [anuntBazarIDs]);

    useEffect( () => {
        fetchAnuntBazarIDs();
        if(!genuriLiterare.includes("Alege categoria")) {
            genuriLiterare.unshift("Alege categoria");
        }

    },[])

    const currentAnunturi = anunturiDetails.slice(0, anunturiPerPage);

    return (
        <div className='bazar-container'>

            <HeaderBazar/>


            <div className='searchbar-container'>
                <input className='searchbar-anunturi' type='text' placeholder='Incepeti cautarea' value={stringCautare} onChange={(e) => setStringCautare(e.target.value)} />
                <button className='btn-cauta' onClick={() => {fetchAnuntBazarIDs()}}>Cauta</button>
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
                                            <tr onClick={() => selectSortare("Sorteaza dupa")}><td>Sorteaza dupa</td></tr>
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
                <div className='container-rezultate-header'>
                    <p>REZULTATE</p>
                </div>
                <div className='container-rezultate'>
                    {currentAnunturi.map((anunt) => (
                        <Anunt className="anunt-card" key={anunt.id} {...anunt} />
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className='pagination-container'>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setCurrentPage(i+1)}
                                disabled={i+1 === currentPage}
                                className='pagination-button'
                            >
                                {i+1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Bazar;
