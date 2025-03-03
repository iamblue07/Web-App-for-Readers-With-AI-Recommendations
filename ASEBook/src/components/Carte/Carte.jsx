import React, { useEffect, useState } from "react";
import config from "../../utils/config";
import "./Carte.css";
import stockimage from "../../assets/stock_book.jpg";
import { useNavigate } from "react-router-dom";

const Carte = (carteData) => {

    const [imagePath, setImagePath] = useState(stockimage)
    const navigate = useNavigate();

    const fetchCarteImagine = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/${carteData.id}/getCarteImagine`, {
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

    useEffect( () => {
        fetchCarteImagine();
    }, [])

    return (
        <div className="book-main-container" onClick={() => {
            navigate(`carte/${carteData.id}`)            
        }}>
                <div className="image-container">
                    <img
                    src={imagePath}
                    alt={"Book image"}
                    className="bookImage"/>
            </div>
            <div className="details-container">
                <p className="titlu">{carteData.titlu}</p>
                <p className="autor">{carteData.autor}</p>
                <p className="pret">De la {carteData.pretMinim} RON</p>
            </div>
        </div>
    )
}

export default Carte;