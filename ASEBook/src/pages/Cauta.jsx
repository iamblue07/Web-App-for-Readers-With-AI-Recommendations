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

    // Fetch book IDs based on search and filters for the current page
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
            setTotalPages(data.totalPages);  // Update total pages based on the response
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch book details for the current page's book IDs
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
        handleSearch(); // Fetch book IDs when search or filters change
    }, [searchWords, genuriSelectate, pretMinim, pretMaxim, currentPage]);  // Re-run search when filters or page change

    useEffect(() => {
        getBooksDetails(bookIds); // Fetch book details for the current set of book IDs
    }, [bookIds]);  // Only run when book IDs change

    const currentBooks = booksDetails.slice(0, booksPerPage); // Slice books to only show the ones for the current page

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
                <button className='btnCauta' onClick={() => { setBooksDetails([]); setCurrentPage(1); handleSearch(); }}>Caută</button>
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
                    <div className='container-rezultate'>
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
