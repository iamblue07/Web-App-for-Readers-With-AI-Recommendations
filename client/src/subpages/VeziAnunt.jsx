import React, {useState, useEffect, useContext} from "react";
import { createToast } from "../utils/createToast";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import config from "../utils/config";
import stock_book from "../assets/stock_book.jpg";
import stock from "../assets/stock.jpg";
import text from "../utils/text";
import "../styles/VeziAnunt.css";
import RaportareButon from "../components/RaportareButon/RaportareButon";

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
    const [chatID, setChatID] = useState(0);
    const fetchCheckAnuntContactat = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/checkAnuntContactat/${idAnunt}`, {
                method:"GET",
                headers:{
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`
                }
            });
            if(!response.ok) {
                console.log("Eroare la verificarea contactarii anuntului!");
                return;
            }
            const data = await response.json();
            setAlreadyContacted(data.hasContacted);
            setChatID(data.chatID);
        }catch(error){
            console.log(error);
        }
    }

    const [userHasReportRights, setUserHasReportRights] = useState(true);
    const fetchUserRights = async () => {
        if(!authData?.token) {
            return;}
        try {
            const response = await fetch(`${config.API_URL}/api/getForumRights`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
            })
            if(!response.ok) {
                createToast("Eroare la verificarea drepturilor!", false);
                setUserHasReportRights(false);
            }
            if(response.ok){
                const data = await response.json();
                setUserHasReportRights(data.hasReportRights);
            }

        } catch(error) {
            createToast(error, false);
            setUserHasRights(false);
        }
    } 

    useEffect(() => {
        fetchAnuntData();
        fetchCheckAnuntContactat();
        fetchUserRights();
    }, [])

    useEffect(()=> {
        fetchAnuntData();
        fetchUtilizatorData();
        checkOwning();
    }, [idAnunt])

    useEffect(() => {
        if (anuntData.idUtilizator) {
            fetchUtilizatorImagine();
        }
    }, [anuntData.idUtilizator]);

    const [newMessage, setNewMessage] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const fetchCreateChat = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/${idAnunt}/createChat`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${authData.token}`
                },
                body: JSON.stringify({newMessage})
            });
            if(!response.ok){
                console.log("Eroare la crearea chatului!");
                setIsDisabled(false);
                return;
            }
            setNewMessage("");
            setAlreadyContacted(true);
        }catch(error){
            console.log(error);
        }
    }

    const [isOwningAnunt, setIsOwningAnunt] = useState(true);
    const checkOwning = async () => {
        if(authData) {
            try{
                const response = await fetch(`${config.API_URL}/api/bazar/${idAnunt}/checkOwning`, {
                    method: "GET",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization": `Bearer ${authData.token}`
                    }
                });
                if(!response.ok) {
                    console.log("Eroare la verificarea detinerii anuntului!");
                }
                const data = await response.json();
                setIsOwningAnunt(data.isOwning);
            }catch(error){
                console.log(error);
            }
        } else {
            setIsOwningAnunt(false);
        }

    }

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
                {userHasReportRights && (<RaportareButon idObiect={idAnunt} tipObiect={"Anunt"} authData={authData}/>)}
                <div className="VeziAnunt-utilizator">
                    <img src={userImage}
                    alt={"Seller Image"}
                    className="VeziAnunt-seller-image"/>
                    <p className="VeziAnunt-p-utilizator">{utilizatorData.username}</p>
                </div>
                {isOwningAnunt === false ? (<>
                    {alreadyContacted === true ? (
                    <button className="VeziAnunt-Send-Message" onClick={() => {navigate('/bazar/conversatii', {state: {chatID: chatID}})}}>Vezi conversatia</button>)
                    : (<>
                    <input type="text" value={newMessage} onChange={(e) => {setNewMessage(e.target.value)}}/>
                    <button className="VeziAnunt-Send-Message" onClick={()=>{setIsDisabled(true); fetchCreateChat()}} disabled={isDisabled}>Trimite mesaj</button>
                    </>)}
                </>) : (<></>)}

                <p className="VeziAnunt-p-ConsumerRights">Drepturile consumatorilor si siguranta in aplicatie</p>
                <p className="VeziAnunt-p-Text">{text.consumerRights}</p>
            </div>
        </div>
    )
}

export default VeziAnunt;