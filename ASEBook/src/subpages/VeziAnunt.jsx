import React, {useState, useEffect, useContext} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import config from "../utils/config";
import stock_book from "../assets/stock_book.jpg";
import stock from "../assets/stock.jpg";
import text from "../utils/text";
import "../styles/VeziAnunt.css";

const VeziAnunt = () => {

    const {authData} = useContext(GlobalContext);
    const navigate = useNavigate();
    const {idAnunt} = useParams();
    const [anuntData, setAnuntData] = useState({});
    const [imagePath, setImagePath] = useState(stock_book);

    const fetchAnuntData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/anunt/${idAnunt}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if(!response.ok) {
                console.log("Eroare la preluarea datelor anuntului!");
                return;
            }
            const data = await response.json();
            setAnuntData(data);
            console.log(data);
            fetchAnuntImagine()
        }catch(error){
            console.log(error);
        }
    }
    
    const fetchAnuntImagine = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/${idAnunt}/getAnuntImagine`, {
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
        } catch(error) {
            console.error("Eroare la preluarea imaginii cartii: ", error);      
        }
    }

    const [utilizatorData, setUtilizatorData] = useState({});
    const fetchUtilizatorData = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/anunt/${idAnunt}/sellerData`, {
                method:"GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if(!response.ok) {
                console.log("Eroare la preluarea datelor sellerului!");
                return;
            }
            const data = await response.json();
            if(!data) {
                console.log("Eroare la setarea datelor!");
                return;
            }
            setUtilizatorData(data);
            console.log(data);

        } catch(error) {
            console.log(error);
        }
    }


    const [userImage, setUserImage] = useState(stock);
    const fetchUtilizatorImagine = async () => {
        try{
            const response = await fetch(`${config.API_URL}/${anuntData.idUtilizator}/getImagineProfil`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if(!response.ok) {
                console.log("Eroare la preluarea imaginii sellerului!");
                return;
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (data.caleImagine) {
                    setUserImage(`${config.API_URL}/${data.caleImagine}`);
                }
            } else if (contentType && contentType.indexOf("image/") !== -1) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setUserImage(imageUrl);
            } else {
                console.error("Răspunsul nu este de tip JSON sau imagine.");
            }
        }catch(error){
            console.log(error);
        }
    }

    const [alreadyContacted, setAlreadyContacted] = useState(false);
    const fetchCheckAnuntContactat = async () => {

    }

    useEffect(() => {
        fetchAnuntData();
    }, [])

    useEffect(()=> {
        fetchAnuntData();
        fetchUtilizatorData();
    }, [idAnunt])

    useEffect(() => {
        if (anuntData.idUtilizator) {
            fetchUtilizatorImagine();
        }
    }, [anuntData.idUtilizator]);

    return(
        <div className="VeziAnunt-main-container">
            <div className="VeziAnunt-left-container">
                <div className="VeziAnunt-date-picture">
                    <p className="VeziAnunt-p-date">Publicat in data de: {new Date(anuntData.dataAnunt).toLocaleString()}</p>
                    <img src={imagePath}
                        alt={"Anunt Image"}
                        className="VeziAnunt-image"/>
                </div>
                <div className="VeziAnunt-price-description">
                    <p className="VeziAnunt-title">Titlu: {anuntData.titluAnunt}</p>
                    <div className="VeziAnunt-price">
                        <p className="VeziAnunt-p-pret">Pret: {anuntData.pretAnunt} RON&nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp;</p>
                        {anuntData.esteNegociabil === true ? 
                        (<p className="VeziAnunt-negociabil">Negociabil</p>) : 
                        (<p className="VeziAnunt-non-negociabil">Nu e negociabil</p>)}
                    </div>
                    <p className="VeziAnunt-genLiterar">Gen literar: {anuntData.genLiterar}</p>
                    <div className="VeziAnunt-description">
                        <p className="VeziAnunt-p-description-header">Descriere:</p>
                        <p className="VeziAnunt-p-description">{anuntData.descriereAnunt}</p>
                    </div>
                </div>
            </div>
            <div className="VeziAnunt-right-container">
                <div className="VeziAnunt-utilizator">
                    <img src={userImage}
                    alt={"Seller Image"}
                    className="VeziAnunt-seller-image"/>
                    <p className="VeziAnunt-p-utilizator">{utilizatorData.username}</p>
                </div>
                {alreadyContacted === true ? (
                    <button className="VeziAnunt-Send-Message">Vezi conversatia</button>) : (
                    <button className="VeziAnunt-Send-Message">Trimite mesaj</button>)}
                <p className="VeziAnunt-p-ConsumerRights">Drepturile consumatorilor si siguranta in aplicatie</p>
                <p className="VeziAnunt-p-Text">{text.consumerRights}</p>
            </div>
        </div>
    )
}

export default VeziAnunt;