import React, { useEffect, useState, useContext } from "react";
import config from "../../utils/config";
import "./Istoric-Lectura.css";
import { GlobalContext } from "../../context/GlobalState";

const IstoricLectura = () => {
    const [istoricData, setIstoricData] = useState([]);
    const { authData } = useContext(GlobalContext);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    const fetchUserIstoric = async () => {
        try {
            if (!authData.token) {
                console.log("No token");
                return;
            }
            const response = await fetch(`${config.API_URL}/api/getIstoric`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`
                }
            });
            if (!response.ok) {
                console.log("Eroare la preluarea datelor!");
                return;
            }
            const data = await response.json();
            setIstoricData(data);
        } catch (error) {
            console.log("Eroare preluarea istoricului: ", error);
        }
    };

    useEffect(() => {
        fetchUserIstoric();
    }, []);

    const fetchUnmark = async (idCarte) => {
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
            setIstoricData(istoricData.filter(item => item.idCarte !== idCarte));
        }catch(error) {
            console.log("Eroare la demarcarea cartii")
        }
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = istoricData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(istoricData.length / itemsPerPage);

    return (
        <div className="istoric-container">
            <table className="tabel-istoric">
                <thead className="tabel-istoric-header">
                    <tr className="tabel-istoric-row">
                        <th className="tabel-istoric-head">Titlu</th>
                        <th className="tabel-istoric-head">Autor</th>
                        <th className="tabel-istoric-head">Acțiune</th>
                    </tr>
                </thead>
                <tbody className="tabel-istoric-body">
                    {currentItems.map((item) => (
                        <tr className="tabel-istoric-row" key={item.idCarte}>
                            <td className="tabel-istoric-data">{item.titlu}</td>
                            <td className="tabel-istoric-data">{item.autor}</td>
                            <td className="tabel-istoric-data">
                                <button className="tabel-istoric-buton" onClick={() => fetchUnmark(item.idCarte)}>Șterge</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination-istoric">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button 
                        key={index + 1} 
                        onClick={() => setCurrentPage(index + 1)}
                        className={currentPage === index + 1 ? "active" : ""}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IstoricLectura;
