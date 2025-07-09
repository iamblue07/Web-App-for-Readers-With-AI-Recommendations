import { useState, useEffect, useContext } from 'react';
import CautaFiltre from '../components/Cauta-Filtre/Cauta-Filtre';
import config from '../utils/config';
import "../styles/Cauta.css";
import Carte from '../components/Carte/Carte';
import LoadingScreen from '../components/Incarcare/Incarcare';
import { BookContext } from '../context/CautaState';

const booksPerPage = 16;

const Cauta = () => {
const {
    bookIds,
    setBookIds,
    booksDetails,
    setBooksDetails,
    currentPage,
    setCurrentPage,
    searchWords,
    setSearchWords,
    genuriSelectate,
    setGenuriSelectate,
    pretMinim,
    setPretMinim,
    pretMaxim,
    setPretMaxim,
    totalPages,
    setTotalPages,
    pageInput,
    setPageInput,
    sortareSelectata,
    setSortareSelectata
  } = useContext(BookContext);

    const [dataFullyLoaded, setDataFullyLoaded] = useState(false);

    const handleSearch = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/postCartiIDs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ searchWords, genuriSelectate, pretMinim, pretMaxim, currentPage, booksPerPage, sortareSelectata })
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
            setDataFullyLoaded(true);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [currentPage]);

    useEffect(() => {
        getBooksDetails(bookIds);
    }, [bookIds]);

    const currentBooks = booksDetails.slice(0, booksPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePageInputChange = (e) => {
        const val = e.target.value;
        // Allow only digits
        if (/^\d*$/.test(val)) {
            setPageInput(val);
        }
    };

    const goToPage = () => {
        const pageNumber = parseInt(pageInput, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
        setPageInput('');
    };

    const isGoDisabled = () => {
        if (pageInput === '') return true;
        const num = parseInt(pageInput, 10);
        return isNaN(num) || num < 1 || num > totalPages;
    };


    

    if(!dataFullyLoaded) {
        return (
            <LoadingScreen/>
        )
    }

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
                <button 
                    className='btnCauta' 
                    onClick={() => { setBooksDetails([]); setCurrentPage(1); handleSearch(); }}
                >
                    Cauta
                </button>
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
                        sortareSelectata={sortareSelectata}
                        setSortareSelectata={setSortareSelectata}
                        setBookIds={setBookIds}
                        setTotalPages={setTotalPages}
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
                        <div className="pagination-center">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            &lt; Prev
                        </button>
                        <span className="pagination-current">
                            Pagina {currentPage} din {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Next &gt;
                        </button>
                        </div>

                        <div className="pagination-right">
                        <input
                            type="text"
                            className="pagination-input"
                            placeholder="Nr."
                            value={pageInput}
                            onChange={handlePageInputChange}
                        />
                        <button
                            onClick={goToPage}
                            disabled={isGoDisabled()}
                            className="pagination-go"
                        >
                            Go
                        </button>
                        </div>
                    </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Cauta;
