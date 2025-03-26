import React, {useState, useEffect, useContext} from "react";
import { GlobalContext } from "../../context/GlobalState";
import DashboardRaportItem from "../DashboardRaportItem/DashboardRaportItem";
import DashboardRaportDetails from "../DashboardRaportDetails/DashboardRaportDetails";
import config from "../../utils/config";
import "./DashboardComponent.css";

const DashboardComponent = ({isAdmin}) => {

    const [viewOpenClosedReports, setViewOpenClosedReports] = useState(false);
    const {authData} = useContext(GlobalContext);
    
    const [reportsIDs,setReportsIDs] = useState([]);
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [canShow, setCanShow] = useState(false);
    const fetchReportsIDs = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/raport/getReportsIDs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify({currentPage, viewOpenClosedReports, itemsPerPage})
            });
            if(!response.ok) {
                console.log('Eroare la preluarea datelor');
                return;
            }
            const data = await response.json();
            setTotalReports(data.totalIDs);
            setReportsIDs(data.ids);
            console.log(data);
            setCanShow(true);
        }catch(error){
            console.log("Eroare la preluarea datelor!");
        }
    }

    const [reportData, setReportData] = useState(null)


    useEffect(()=> {
        setCanShow(false);
        fetchReportsIDs();
    }, [viewOpenClosedReports, currentPage])

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return(
        <> {canShow && 
        (<div className={`Dashboard-main-container ${reportData ? "with-details" : ""}`}>
            {isAdmin && 
            <div className="Dashboard-reports-items-list">
                <div className="Dashboard-header">
                    <button className="Dashboard-header-button" onClick={()=>{setViewOpenClosedReports(true); setReportData(null)}}>Vezi rapoartele deschise</button>
                    <button className="Dashboard-header-button" onClick={()=>{setViewOpenClosedReports(false); setReportData(null)}}>Vezi rapoartele inchise</button>
                </div>
                {reportsIDs.map((reportID) => (
                    <DashboardRaportItem key={reportID} idRaport={reportID} setReportData={setReportData} />
                ))}
            </div>}
            {(isAdmin && reportData !== null) && 
            <div className="Dashboard-Report-Data">
                <DashboardRaportDetails reportData={reportData}/>
            </div>}
        </div>)}
        <div className="pagination-container">
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        disabled={i + 1 === currentPage}
                        className={`pagination-button ${i + 1 === currentPage ? 'active' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </>
    )
};

export default DashboardComponent;