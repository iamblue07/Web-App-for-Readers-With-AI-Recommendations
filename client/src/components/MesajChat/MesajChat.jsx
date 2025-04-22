import React, { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../../context/GlobalState";
import config from "../../utils/config";
import stockimage from '../../assets/stock.jpg';
import "./MesajChat.css";
import RaportareButon from "../RaportareButon/RaportareButon";
const MesajChat = ({idMesaj}) => {


    const {authData} = useContext(GlobalContext);

    const [mesajData, setMesajData] = useState({});
    const [messageIsMedia, setMessageIsMedia] = useState(false);
    const fetchMesajData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/getMesajData/${idMesaj}`, {
                method:"GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${authData.token}`
                },
            });
            if(!response.ok){
                console.log("Eroare la preluarea datelor mesajului!");
            }
            const data = await response.json();
            setMesajData(data);
            console.log(data);
        }catch(error){
            console.log(error);
        }
    }

    const [userImage, setUserImage] = useState(stockimage);
    const fetchUtilizatorImagine = async () => {
        try{
            const response = await fetch(`${config.API_URL}/${mesajData.idUtilizator}/getImagineProfil`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if(!response.ok) {
                console.log("Eroare la preluarea imaginii utilizatorului!");
                return;
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("image/") !== -1) {
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


    const [messageMedia, setMessageMedia] = useState(stockimage);
    const fetchMesajMedia = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/getMesajMedia/${idMesaj}`,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if(!response.ok) {
                console.log("Eroare la preluarea imaginii trimise!");
                return;
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("image/") !== -1) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setMessageMedia(imageUrl);
            } else {
                console.error("Răspunsul nu este de tip JSON sau imagine.");
            }
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchMesajData();
    },[])

    useEffect(()=>{
        if (mesajData && Object.keys(mesajData).length !== 0) {
            setMessageIsMedia(mesajData.esteMedia);
            if(mesajData.esteMedia === true) {
                fetchMesajMedia();
            }
            fetchUtilizatorImagine();
        }
    },[mesajData])


    const [viewReportButton, setViewReportButton] = useState(false);
    
    return (
        <div className={`MesajChat-main-container ${mesajData.acelasiUser ? 'MesajChat-sameUser' : 'MesajChat-otherUser'}`}>
            {!mesajData.acelasiUser && (
                <img src={userImage}
                    className="MesajChat-ImagineUser"
                />
            )}
            {mesajData.esteMedia === true ? (
                <img src={messageMedia}
                    className="MesajChat-MediaImage"
                    onClick={() => {setViewReportButton(!viewReportButton)}}
                />
                ):(<p className="MesajChat-Continut" onClick={() => {setViewReportButton(!viewReportButton)}}>
                        {mesajData.continut}</p>
                    )}
            {viewReportButton && (<RaportareButon idObiect={mesajData.idMesaj} tipObiect={"MesajChat"} authData={authData}/>)}
            {mesajData.acelasiUser && (
                <img src={userImage}
                    className="MesajChat-ImagineUser"
                />
            )}
        </div>
    )
}

export default MesajChat;