import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import stockimage from "../../assets/stock_book.jpg";
import config from "../../utils/config";
import "./Anunt.css";

const Anunt = (anuntData) => {

    const [imagePath, setImagePath] = useState(stockimage)
    const navigate = useNavigate();

    const fetchAnuntImagine = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/${anuntData.id}/getAnuntImagine`, {
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
                console.error("Raspunsul nu este de tip JSON sau imagine");
            }
        }catch(error){
            console.error("Eroare la preluarea imaginii cartii: ", error);
        }
    }


    useEffect( () => {
        fetchAnuntImagine();
    }, [])

    return (<>
        <div className="anunt-main-container">
            <div className="anunt-imagine">
                <img
                    src={imagePath}
                    alt={"Book image"}
                    className="bookImage"/>
            </div>
            <div className="anunt-subcontainer">
                <div className="anunt-titlu-pret">
                    <p className="anuntData-titlu" onClick={() => {navigate(`/bazar/anunt/${anuntData.id}`)}}>{anuntData.titlu}</p>
                    <div className="anunt-pret-negociabil">
                        <p className="anuntData-pret">{anuntData.pret} RON</p>
                        {anuntData.negociabil ? 
                            <p className="negociabil">Negociabil</p> :
                            <p className="non-negociabil">Nu e negociabil</p>
                        }
                    </div>
                </div>
                <div className="anunt-descriere">
                    <p className="anuntData-descriere">{anuntData.descriere}</p>
                </div>
                <div className="anunt-utilizator-data">
                    <p className="anuntData-utilizator">{anuntData.utilizator}</p>
                    <p className="anuntData-data">Postat in data de {(new Date(anuntData.data)).toLocaleString()}</p>
                </div>
            </div>
        </div>
    </>)
}

export default Anunt;