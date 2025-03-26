import React, {useState, useEffect, useContext} from "react";
import { GlobalContext } from "../../context/GlobalState";
import config from "../../utils/config";
import "./DashboardRaportItem.css";

const DashboardRaportItem = ({idRaport, setReportData}) => {

    const [itemData, setItemData] = useState({})
    const {authData} = useContext(GlobalContext);

    const fetchReportData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/raport/getReportData/${idRaport}`, {
                method: 'GET',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization': `Bearer ${authData.token}`
                }
            })
            if(!response.ok){
                console.log("Eroare la preluarea datelor!");
                return;
            }
            const data = await response.json();
            console.log("Item", data);
            setItemData(data);
        }catch(error){
            console.log(error);
            return;
        }
    }

    useEffect(()=>{
        if(idRaport) {
            fetchReportData();
        }
    },[idRaport])

    return (
        <div className="DashboardRaportItem-main-container">
            <p className="Dashboard-p-id">{itemData.id}</p>
            <p className="Dashboard-p">{itemData.obiectRaport}</p>
            <p className="Dashboard-p">Data: {new Date(itemData.dataRaport).toLocaleDateString()}</p>
            <button className="DashboardRaportItem-vezi" onClick={()=>{setReportData(itemData)}}>Vezi Raport</button>
        </div>
    )
}

export default DashboardRaportItem;