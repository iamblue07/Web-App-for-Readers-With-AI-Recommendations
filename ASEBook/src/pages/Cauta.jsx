import { useState, useEffect } from 'react';
import CautaFiltre from '../components/Cauta-Filtre/Cauta-Filtre';
import config from '../utils/config';
import "../styles/Cauta.css";
import Carte from '../components/Carte/Carte';

const booksPerPage = 9;

const Cauta = () => {
    const [searchWords, setSearchWords] = useState('');
    const [genuriSelectate, setGenuriSelectate] = useState([]);
    const [pretMinim, setPretMinim] = useState(0);
    const [pretMaxim, setPretMaxim] = useState(9999);
    const [bookIds, setBookIds] = useState([]);
    const [booksDetails, setBooksDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleSearch = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/postCartiIDs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchWords, genuriSelectate, pretMinim, pretMaxim, currentPage, booksPerPage })
            });
            if (!response.ok) {
                console.log('Eroare la preluarea datelor');
                return;
            }
            const data = await response.json();
            setBookIds(data.ids);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    const getBooksDetails = async (ids) => {
        if (ids.length === 0) return;

        try {
            const response = await fetch(`${config.API_URL}/api/postCartiData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) {
                console.log("Eroare la preluarea detaliilor!");
                return;
            }
            const data = await response.json();
            setBooksDetails(data);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [searchWords, genuriSelectate, pretMinim, pretMaxim, currentPage]);

    useEffect(() => {
        getBooksDetails(bookIds);
    }, [bookIds]);

    const currentBooks = booksDetails.slice(0, booksPerPage);

    return (
        <div className="Cauta-Main-Container">
            <div className='container-Search-Button'>
                <input 
                    className='input-search' 
                    type='text' 
                    placeholder='Introdu cuvinte-cheie' 
                    value={searchWords} 
                    onChange={(e) => setSearchWords(e.target.value)} 
                />
                <button className='btnCauta' onClick={() => { setBooksDetails([]); setCurrentPage(1); handleSearch(); }}>Cauta</button>
            </div>
            <div className='container-filtre-rezultate'>
                <div className='container-filtre'>
                    <CautaFiltre 
                        genuriSelectate={genuriSelectate}
                        setGenuriSelectate={setGenuriSelectate}
                        pretMinim={pretMinim} 
                        setPretMinim={setPretMinim}
                        pretMaxim={pretMaxim} 
                        setPretMaxim={setPretMaxim}
                    />
                </div>
                <div className='container-rezultate-header'>
                    <div className='container-header'>
                        <p>REZULTATE</p>
                    </div>
                    <div className='container-cauta-rezultate'>
                        {currentBooks.map((book) => (
                            <Carte key={book.isbn} {...book} />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setCurrentPage(i + 1)}
                                    disabled={i + 1 === currentPage}
                                    className={`pagination-button ${i + 1 === currentPage ? 'active' : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cauta;
