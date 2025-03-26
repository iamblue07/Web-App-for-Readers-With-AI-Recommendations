import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../context/GlobalState";
import config from "../../utils/config";
import "./DashboardRaportDetails.css";

const DashboardRaportDetails = ({reportData}) => {

    const {authData} = useContext(GlobalContext);

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

    useEffect(()=>{
        setCanLoad(false);
        fetchExtendedData();
    },[reportData])

   return (<>
        {canLoad && (<>
            <div className="DashboardRaportDetails-main-container">
            <p className="Dashboard-p">Utilizator raportat: {extendedData.reportedUsername}</p>
            <p className="Dashboard-p">Tip continut: {reportData.obiectRaport}</p>
            <p className="Dashboard-p">Continut: 
                {reportData.obiectRaport === "MesajChat" && (
                    <>{extendedData.data.continut}</>
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
            {reportData.obiectRaport === "Forum" && (
                <>
                <button className="Dashboard-buton">Vezi Forumul</button>
                <button className="Dashboard-buton">Sterge Forumul</button>
                </>

            )}
            {reportData.obiectRaport === "Anunt" && (
                <>
                <button className="Dashboard-buton">Vezi Anuntul</button>
                <button className="Dashboard-buton">Sterge Anuntul</button>
                </>
            )}
            <button className="Dashboard-buton">Retrage drepturile asociate</button>
            <p className="Dashboard-p">Utilizator raportor: {extendedData.reporterUsername}</p>
            <button className="Dashboard-buton">Inchide raportul</button>
        </div></>)}
        </>
    )
}

export default DashboardRaportDetails;