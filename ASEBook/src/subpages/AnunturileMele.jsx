import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import { ToastContainer } from "react-toastify";
import { createToast } from "../utils/createToast";
import config from "../utils/config";
import HeaderBazar from "../components/HeaderBazar/HeaderBazar";
import AnuntulMeu from "../components/AnuntulMeu/AnuntulMeu";
import "../styles/AnunturileMele.css";
const AnunturileMele = () => {
    const navigate = useNavigate();
    const [anunturiIDs, setAnunturiIDs] = useState([]);
    const [countAnunturi, setCountAnunturi] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const { authData } = useContext(GlobalContext);

    useEffect(() => {
        if (!authData.token) {
            navigate("/bazar");
            return;
        }
        fetchAnunturileMeleIDs();
    }, [authData.token]);

    const fetchAnunturileMeleIDs = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/getAnunturileMeleIDs`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`,
                },
            });
    
            if (!response.ok) {
                createToast("Eroare la preluarea anunturilor tale!", false);
                return;
            }
    
            const data = await response.json();
            
            if (!Array.isArray(data.anunturiIds)) {
                console.error("Invalid data format:", data);
                return;
            }
    
            setAnunturiIDs(data.anunturiIds || []);
            setCountAnunturi(data.totalAnunturi || 0);
            console.log(data);
            console.log(anunturiIDs);
        } catch (error) {
            console.error("Error fetching anunturi:", error);
        }
    };
    
    const totalPages = Math.ceil(countAnunturi / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAnunturi = anunturiIDs.slice(indexOfFirstItem, indexOfLastItem);

    const [editingAnuntID, setEditingAnuntID] = useState(0);

    return (
        <div className="AnunturileMele-main-container">
            <ToastContainer />
            <HeaderBazar />
            <div className="anunturi-list">
                {currentAnunturi.map((id) => (
                    <AnuntulMeu key={id} id={id} editingAnuntID={editingAnuntID} setEditingAnuntID={setEditingAnuntID} />
                ))}
            </div>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        className={currentPage === index + 1 ? "active" : ""}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AnunturileMele;