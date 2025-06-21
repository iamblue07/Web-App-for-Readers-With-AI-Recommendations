import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/GlobalState";
import { useNavigate } from "react-router-dom";
import { createToast } from "../../utils/createToast";
import config from "../../utils/config";
import stockimage from '../../assets/stock.jpg';
import "./DashboardRaportDetails.css";

const DashboardRaportDetails = ({reportData, setReportData, fetchReportsIDs}) => {

    const {authData} = useContext(GlobalContext);
    const navigate = useNavigate();
    const [extendedData, setExtendedData] = useState({});
    const [canLoad, setCanLoad] = useState(false);


    const fetchExtendedData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/raport/getExtendedReportData/${reportData.id}`, {
                method:"GET",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${authData.token}`
                }
            });
            if(!response.ok){
                console.log("Eroare la preluarea datelor extinse");
                return;
            }
            const data = await response.json();
            setExtendedData(data);
            console.log("Extended data: ", data);
            setCanLoad(true);
        }catch(error){
            console.log(error);
        }
    }

    const [mediaExists, setMediaExists] = useState(false);
    const [messageMedia, setMessageMedia] = useState(stockimage);
    const fetchMesajMedia = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/getMesajMedia/${extendedData.data.id}`,{
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


    const fetchDisableRights = async(rights, userID) => {
        try{
            const response = await fetch(`${config.API_URL}/api/raport/disableRights`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${authData.token}`
                },
                body: JSON.stringify({penalizedUserID: userID, removedRights: rights})
            });
            if(!response.ok) {
                createToast("Eroare la retragerea drepturilor!", false);
                console.log("Eroare la retragerea drepturilor!");
                return;
            }
            createToast("Drepturile au fost dezactivate cu succes!", true);
        }catch(error){
            console.log("Eroare la retragerea drepturilor: ", error);
        }
    }

    const fetchCloseReport = async() =>{
        try{
            const response = await fetch(`${config.API_URL}/api/raport/closeReport/${reportData.id}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${authData.token}`
                }
            });
            if(!response.ok){
                createToast("Eroare la inchiderea raportului!", false);
                console.log("Eroare la inchiderea raportului!");
                return;
            }
            createToast("Raportul a fost inchis cu succes!", true);
            setExtendedData({data:{}});
            setReportData({});
            fetchReportsIDs();
        }catch(error){
            console.log(error);
        }
    }

    const fetchRemoveForumMessage = async() => {
        try{
            const response = await fetch(`${config.API_URL}/api/raport/removeForumMessage/${reportData.idObiect}`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${authData.token}`
                }
            });
            if(!response.ok){
                createToast("Eroare la stergerea mesajului!", false);
                console.log("Eroare la stergerea mesajului!");
                return;
            }
            createToast("Mesajul a fost sters cu succes!", true);
        }catch(error){
            console.log(error);
        }
    }

    const fetchDeleteObject = async() => {
        try{
            const response = await fetch(`${config.API_URL}/api/raport/deleteObject/${reportData.idObiect}`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization": `Bearer ${authData.token}`
                },
                body: JSON.stringify({obiectRaport: reportData.obiectRaport})
            });
            if(!response.ok){
                createToast("Eroare la stergerea obiectului!", false);
                console.log("Eroare la stergerea obiectului!");
                return;
            }
            createToast("Obiectul a fost sters cu succes!", true);
            fetchCloseReport();
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        setCanLoad(false);
        setMediaExists(false);
        fetchExtendedData();
    },[reportData])

    useEffect(()=>{
        if(extendedData.data && extendedData.data.esteMedia) {
            fetchMesajMedia();
            setMediaExists(true);
        }
    },[extendedData.data])

   return (<>
        {canLoad && (<>
            <div className="DashboardRaportDetails-main-container">
            <p className="Dashboard-p">Utilizator raportat: {extendedData.reportedUsername}</p>
            <p className="Dashboard-p">Tip continut: {reportData.obiectRaport}</p>
            <p className="Dashboard-p">Continut: 
                {reportData.obiectRaport === "MesajChat" && (<>
                    {!mediaExists ? 
                    (<>{extendedData.data.continut}</>) : 
                    (<img src={messageMedia} 
                    alt="Reported media"
                    className="Dashboard-image"/>)}</>
                )}
                {reportData.obiectRaport === "MesajForum" && (
                    <>{extendedData.data.continut}</>
                )}
                {reportData.obiectRaport === "Forum" && (
                    <>{extendedData.data.titluForum}</>
                )}
                {reportData.obiectRaport === "Anunt" && (
                    <>{extendedData.data.titluAnunt}</>
                )}
            </p>
            {reportData.obiectRaport === "Forum" && (<>
                <button className="Dashboard-buton" onClick={() => {navigate(`/forumuri/${extendedData.data.id}`)}}>Vezi Forumul</button>
                <button className="Dashboard-buton" onClick={() => {fetchDeleteObject()}}>Sterge Forumul</button>
                </>
            )}
            {reportData.obiectRaport === "Anunt" && (<>
                <button className="Dashboard-buton" onClick={()=>{navigate(`/bazar/anunt/${extendedData.data.id}`)}}>Vezi Anuntul</button>
                <button className="Dashboard-buton" onClick={() => {fetchDeleteObject()}}>Sterge Anuntul</button>
                </>
            )}
            {reportData.obiectRaport === "MesajForum" && (
                <button className="Dashboard-buton" onClick={()=>{fetchRemoveForumMessage()}}>Sterge mesajul</button>
            )}
            <button className="Dashboard-buton" onClick={()=>{fetchDisableRights(reportData.obiectRaport, extendedData.data.idUtilizator)}}>Retrage drepturile asociate</button>
            <p className="Dashboard-p">Utilizator raportor: {extendedData.reporterUsername}</p>
            <p className="Dashboard-p">Motivul Raportarii: {reportData.descriere}</p>
            <button className="Dashboard-buton" onClick={()=>{fetchDisableRights("Raport", reportData.idRaportor)}}>Retrage drepturile raportorului</button>
            <button className="Dashboard-buton" onClick={()=>{fetchCloseReport()}}>Inchide raportul</button>
        </div></>)}
        </>
    )
}

export default DashboardRaportDetails;