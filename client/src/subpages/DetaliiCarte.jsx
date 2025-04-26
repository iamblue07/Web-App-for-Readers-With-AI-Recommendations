import React, {useState, useContext, useEffect} from "react";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import stockimage from "../assets/stock_book.jpg";
import config from "../utils/config";
import '../styles/DetaliiCarte.css';
import CautaAnunturi from "../components/Cauta-Anunturi/Cauta-Anunturi.jsx";

const DetaliiCarte = () => {
    const {idCarte} = useParams();
    const {authData} = useContext(GlobalContext);
    const [bookDetails, setBookDetails] = useState([]);
    const [bookOffers, setBookOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [imagePath, setImagePath] = useState(stockimage);
    const [bookIsMarked, setBookIsMarked] = useState(true);
    const [viewBazarOffers, setViewBazarOffers] = useState(false);
    const [isLoadingAnunturi, setIsLoadingAnunturi] = useState(true);
    const [canViewDescription, setCanViewDescription] = useState(false);
    const [totalAnunturi, setTotalAnunturi] = useState(0);
    const [bazarAnunturiIDs, setBazarAnunturiIDs] = useState([]);
    const [googleData, setGoogleData] = useState(null);
    const [googleOffer, setGoogleOffer] = useState(null);

    const fetchBazarAnunturiIDs = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/anunturiIDs/${idCarte}`, {
                method: "GET",
                headers: {'Content-Type': 'application/json'}
            });
            if(!response.ok) return;
            const data = await response.json();
            if(data) {
                setBazarAnunturiIDs(data.anunturiIds);
                setTotalAnunturi(data.totalAnunturi);
                setIsLoadingAnunturi(false);
            }
        } catch(error) {
            console.log("Failed loading offers data");
        }
    };

    const fetchLoadBook = async () => {
        try { 
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
            if(!response.ok) return;
            const data = await response.json();
            if(data) {
                setBookDetails(data);
                fetchCarteImagine();
                setIsLoading(false);
            }
        } catch(error) {
            console.log("Failed loading book data.");
        }
    };

    const fetchCarteImagine = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/${idCarte}/getCarteImagine`, {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            });
            if(!response.ok) return;
            
            const contentType = response.headers.get("content-type");
            if(contentType?.includes("application/json")) {
                const data = await response.json();
                if(data.caleImagine) {
                    setImagePath(`${config.API_URL}/${data.caleImagine}`);
                }
            } else if(contentType?.includes("image/")) {
                const imageBlob = await response.blob();
                setImagePath(URL.createObjectURL(imageBlob));
            }
        } catch(error) {
            console.error("Eroare la preluarea imaginii cartii: ", error);
        }
    };

    const fetchCarteOferte = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/oferte`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            });
            if(response.ok) {
                const data = await response.json();
                setBookOffers(data || []);
            }
        } catch(error) {
            console.log("Eroare la preluarea ofertelor cartii");
        }
    };

    const fetchCheckIsRead = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/esteCitita`, {
                method: "GET",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                }
            });
            if(response.ok) {
                const data = await response.json();
                setBookIsMarked(!!data.isRead);
            }
        } catch(error) {
            console.log("Eroare la verificarea cartii");
        }
    };

    const fetchMarkAsRead = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/marcheazaCitita`, {
                method: "POST",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                }
            });
            if(response.ok) {
                const data = await response.json();
                setBookIsMarked(data.Marked);
            }
        } catch(error) {
            console.log("Eroare la marcarea cartii");
        }
    };

    const fetchUnmark = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/demarcheazaCitita`, {
                method: "POST",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                }
            });
            if(response.ok) {
                const data = await response.json();
                setBookIsMarked(data.Marked);
            }
        } catch(error) {
            console.log("Eroare la demarcarea cartii");
        }
    };

    const fetchGoogleBooksData = async (isbn) => {
        try {
            const cleanISBN = isbn.replace(/-/g, '');
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}&key=${config.GOOGLE_BOOKS_API_KEY}`
            );
            const data = await response.json();
            setGoogleData(data);
            
            if(data.items?.length > 0) {
                const firstResult = data.items[0];
                const saleInfo = firstResult.saleInfo || {};
                const price = saleInfo.listPrice || saleInfo.retailPrice;
                const buyLink = saleInfo.buyLink;

                if(price && buyLink) {
                    setGoogleOffer({
                        magazin: "Google Books",
                        pretOferta: `${price.amount} ${price.currencyCode}`,
                        linkOferta: buyLink
                    });
                } else {
                    setGoogleOffer(null);
                }
            }
        } catch(error) {
            console.error("Error fetching Google Books data:", error);
        }
    };

    useEffect(() => {
        fetchLoadBook();
        fetchCarteOferte();
        if(authData.token) fetchCheckIsRead();
    }, [authData.token]);

    useEffect(() => {
        if(bookDetails.isbn) fetchGoogleBooksData(bookDetails.isbn);
    }, [bookDetails.isbn]);

    return (
        <div className="DetaliiCarte-main-container">
            {isLoading ? (
                <p>Data is loading...</p>
            ) : (
                <div>
                    <div className="div-detalii">
                        <div className="book-image-container">
                            <img
                                src={imagePath}
                                alt="Book cover"
                                className="book-image"
                            />
                            <p className="isbn-display">ISBN: {bookDetails.isbn}</p>
                        </div>

                        <div className="details-section">
                            <div className="book-meta-container">
                                <div className="main-details">
                                    <h1 className="book-title">{bookDetails.titlu}</h1>
                                    <h2 className="book-author">{bookDetails.autor}</h2>
                                    <p className="book-genre">{bookDetails.genLiterar}</p>
                                </div>

                                {googleData?.items?.length > 0 && (
                                    <div className="google-details-card">
                                        <div className="google-metadata-grid">
                                            {googleData.items[0].volumeInfo.publisher && (
                                                <div className="metadata-item">
                                                    <span className="metadata-label">Editura</span>
                                                    <span className="metadata-value">
                                                        {googleData.items[0].volumeInfo.publisher}
                                                    </span>
                                                </div>
                                            )}
                                            {googleData.items[0].volumeInfo.publishedDate && (
                                                <div className="metadata-item">
                                                    <span className="metadata-label">An aparitie</span>
                                                    <span className="metadata-value">
                                                        {new Date(googleData.items[0].volumeInfo.publishedDate).getFullYear()}
                                                    </span>
                                                </div>
                                            )}
                                            {googleData.items[0].volumeInfo.pageCount && (
                                                <div className="metadata-item">
                                                    <span className="metadata-label">Pagini</span>
                                                    <span className="metadata-value">
                                                        {googleData.items[0].volumeInfo.pageCount}
                                                    </span>
                                                </div>
                                            )}
                                            {googleData.items[0].volumeInfo.language && (
                                                <div className="metadata-item">
                                                    <span className="metadata-label">Limba</span>
                                                    <span className="metadata-value">
                                                        {googleData.items[0].volumeInfo.language.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {googleOffer && (
                                            <div className="google-offer-banner">
                                                <div className="offer-content">
                                                    <span className="offer-source">Google Books</span>
                                                    <span className="offer-price">{googleOffer.pretOferta}</span>
                                                </div>
                                                <a
                                                    href={googleOffer.linkOferta}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="offer-button"
                                                >
                                                    Cumpara acum
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="interaction-section">
                                    {!!authData.token && (
                                        <div className="bookmark-buttons">
                                            {bookIsMarked ? (
                                                <button className="btn-marked" onClick={fetchUnmark}>
                                                    sterge marcarea
                                                </button>
                                            ) : (
                                                <button className="btn-unmarked" onClick={fetchMarkAsRead}>
                                                    Marcheaza ca citita
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="description-section">
                        <div className="description-header" onClick={() => setCanViewDescription(!canViewDescription)}>
                            <h2>Descriere</h2>
                            <span className={`toggle-arrow ${canViewDescription ? 'open' : ''}`}>▼</span>
                        </div>
                        {canViewDescription && (
                            <div className="description-content">
                                {bookDetails.descriere?.split('\n').map((paragraph, index) => (
                                    paragraph.trim() && (
                                        <p key={index} className="description-paragraph">
                                            {paragraph}
                                        </p>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="offers-section">
                        <h2 className="offers-title">Oferte</h2>
                        <div className="offers-grid">
                            {bookOffers.map((oferta) => (
                                <div key={oferta.id} className="offer-card">
                                    <h3 className="offer-store">{oferta.magazin}</h3>
                                    <p className="offer-price">{oferta.pretOferta} RON</p>
                                    <a href={oferta.linkOferta} className="offer-link">
                                        Vezi oferta
                                    </a>
                                </div>
                            ))}
                            {googleOffer && (
                                <div className="offer-card google-offer">
                                    <h3 className="offer-store">Google Books</h3>
                                    <p className="offer-price">{googleOffer.pretOferta}</p>
                                    <a href={googleOffer.linkOferta} className="offer-link">
                                        Vezi oferta
                                    </a>
                                </div>
                            )}
                        </div>
                        {bookOffers.length === 0 && !googleOffer && (
                            <p className="no-offers">Nu există oferte disponibile pentru această carte</p>
                        )}
                    </div>

                    <div className="bazar-section">
                        <button 
                            className={`bazar-toggle ${viewBazarOffers ? 'active' : ''}`}
                            onClick={() => {
                                setViewBazarOffers(!viewBazarOffers);
                                if(!viewBazarOffers) fetchBazarAnunturiIDs();
                            }}
                        >
                            {viewBazarOffers ? 'Ascunde' : 'Vezi'} ofertele din bazar
                        </button>
                        {viewBazarOffers && (
                            <div className="bazar-results">
                                {isLoadingAnunturi ? (
                                    <p>Se încarcă ofertele...</p>
                                ) : (
                                    <CautaAnunturi anunturiIds={bazarAnunturiIDs} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetaliiCarte;