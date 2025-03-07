import React, {useState, useContext, useEffect} from "react";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import stockimage from "../assets/stock_book.jpg";
import config from "../utils/config";
import '../styles/DetaliiCarte.css'

const DetaliiCarte = () => {

    const {idCarte} = useParams()
    const {authData} = useContext(GlobalContext);
    const [bookDetails, setBookDetails] = useState([])
    const [bookOffers, setBookOffers] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    const [imagePath, setImagePath] = useState(stockimage)
    const [bookIsMarked, setBookIsMarked] = useState(true)

    const fetchLoadBook = async () => {
        try { 
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            })
            if(!response.ok) {
                console.log("Eroare la incarcarea datelor!")
                return;
            }
            const data = await response.json();
            if(!data) {
                console.log("Eroare: datele sunt goale");
                return;
            }
            console.log(data);
            setBookDetails(data);
            fetchCarteImagine();
            setIsLoading(false);
        } catch(error) {
            console.log("Failed loading book data.");
        }
    }

    const fetchCarteImagine = async () => {
            try {
                const response = await fetch(`${config.API_URL}/api/${idCarte}/getCarteImagine`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if(!response.ok) {
                    console.error("Eroare la preluarea imaginii cartii.");
                    return;
                }
                const contentType = response.headers.get("content-type");
                if(contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    if(data.caleImagine) {
                        setImagePath(`${config.API_URL}/${data.caleImagine}`);
                    }
                } else if(contentType && contentType.indexOf("image/") !== -1) {
                    const imageBlob = await response.blob();
                    const imageUrl = URL.createObjectURL(imageBlob);
                    setImagePath(imageUrl);
                } else {
                    console.error("Raspunsul nu este de tip JSON sau imagine.");
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
            if(!response.ok) {
                console.error("Eroare la preluarea ofertelor.");
                return;
            }
            const data = await response.json();
            if(!data) {
                console.log("Eroare: Nu sunt oferte");
                return;
            }
            setBookOffers(data);
            console.log(data);
        }catch(error){
            console.log("Eroare la preluarea ofertelor cartii");
        }
    }

    const fetchCheckIsRead = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/esteCitita`, {
                method: "GET",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                }
            })
            if(!response.ok) {
                console.log("Eroare la verificarea cartii: response not ok");
            }
            const data = await response.json();
            if(!data) {
                console.log("Eroare la verificarea cartii: data is null");
                return;
            }
            if(data.isRead === true) {
                setBookIsMarked(true);
                return;
            }
            setBookIsMarked(false);
        } catch(error) {
            console.log("Eroare la verificarea cartii");
        }
    }

    const fetchMarkAsRead = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/marcheazaCitita`, {
                method: "POST",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                }
            })
            if(!response.ok) {
                console.log("Eroare la verificarea cartii: response not ok");
                return;
            }
            const data = await response.json();
            setBookIsMarked(data.Marked);

        } catch(error) {
            console.log("Eroare la marcarea cartii")
        }
    }

    const fetchUnmark = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/demarcheazaCitita`, {
                method: "POST",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                }
            })
            if(!response.ok) {
                console.log("Eroare la verificarea cartii: response not ok");
                return;
            }
            const data = await response.json();
            setBookIsMarked(data.Marked);
        }catch(error) {
            console.log("Eroare la demarcarea cartii")
        }
    }

    useEffect( () => {
        fetchLoadBook();
        fetchCarteOferte();
        if(authData.token) {
            fetchCheckIsRead();
        }
    }, [authData.token])


    return (
        <div className="DetaliiCarte-main-container">
            {isLoading === true ? (
                <p>Data is loading...</p>
            ) : (
                <div>
                    <div className="div-detalii">
                        <div className="div-emptyDiv-imagine-isbn">
                            <div className="emptyDiv"/>
                            <img
                                src={imagePath}
                                alt={"Book image"}
                                className="bookImage"/>
                            <p className="isbn">ISBN: {bookDetails.isbn}</p>
                        </div>
                        <div className="details-buttons">
                        <div className="div-titlu-autor-gen">
                            <h1 className="DetaliiCarte-h1">Titlu: <p className="DetaliiCarte-p">{bookDetails.titlu}</p></h1>
                            <h1 className="DetaliiCarte-h1">Autor: <p className="DetaliiCarte-p">{bookDetails.autor}</p></h1>
                            <h1 className="DetaliiCarte-h1">Gen literar: <p className="DetaliiCarte-p">{bookDetails.genLiterar}</p></h1>
                        </div>
                        {!!authData.token && (<div>
                                {bookIsMarked ? (
                                    <button className="btnMarked" onClick={ () => {fetchUnmark()}}>Sterge marcarea cărții</button>) : (
                                    <button className="btnUnMarked" onClick={ () => {fetchMarkAsRead()}}>Marchează cartea ca citită</button>)
                                }
                            </div>)}
                        </div>
                    </div>
                    <div className="oferte">
                        {bookOffers.length > 0 ? (
                            bookOffers.map((oferta) => (
                                <div key={oferta.id} className="oferta-item">
                                    <h2>{oferta.magazin}</h2>
                                    <p>Preț: {oferta.pretOferta} RON</p>
                                    <a href={oferta.linkOferta} target="_blank" rel="noopener noreferrer">
                                        Vezi oferta
                                    </a>
                                </div>
                            ))
                        ) : (
                            <p>Nu există oferte disponibile pentru această carte.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetaliiCarte;