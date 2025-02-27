import { useState, useEffect } from 'react';
import CautaFiltre from '../components/Cauta-Filtre/Cauta-Filtre';
import config from '../utils/config';
import "../styles/Cauta.css";
import Carte from '../components/Carte/Carte';

const Cauta = () => {
    const [searchWords, setSearchWords] = useState('');
    const [genuriSelectate, setGenuriSelectate] = useState([]);
    const [pretMinim, setPretMinim] = useState(0);
    const [pretMaxim, setPretMaxim] = useState(9999);
    const [bookIds, setBookIds] = useState([]);
    const [booksDetails, setBooksDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 9;

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
            console.log("Book details: ", data);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/postCartiIDs`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                 },
                body: JSON.stringify({ searchWords, genuriSelectate, pretMinim, pretMaxim })
            });
            if (!response.ok) {
                console.log('Eroare la preluarea datelor');
                return;
            }
            const data = await response.json();
            setBookIds(data);
            console.log("search: ", data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    useEffect(() => {
        getBooksDetails(bookIds);
    }, [bookIds]);

    // Calcularea paginilor
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = booksDetails.slice(indexOfFirstBook, indexOfLastBook);

    // Funcții de navigare între pagini
    const nextPage = () => {
        if (currentPage < Math.ceil(booksDetails.length / booksPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

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
                <button className='btnCauta' onClick={ () => {setBooksDetails([]); handleSearch()}}>Caută</button>
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
                    {booksDetails.length > booksPerPage && (
                        <div className="paginare">
                            <button onClick={prevPage}>Prev</button>
                            <span>{`Pagina ${currentPage} din ${Math.ceil(booksDetails.length / booksPerPage)}`}</span>
                            <button onClick={nextPage}>Next</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cauta;
