import React, { useEffect, useState, useContext } from "react";
import config from "../../utils/config";
import "./Istoric-Lectura.css";
import { GlobalContext } from "../../context/GlobalState";
import { useNavigate } from "react-router-dom";

const IstoricLectura = () => {
    const [istoricData, setIstoricData] = useState([]);
    const { authData } = useContext(GlobalContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingRatings, setUpdatingRatings] = useState({});

    const itemsPerPage = 10;
    const navigate = useNavigate();

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
            console.log(data);
            setIstoricData(data);
        } catch (error) {
            console.log("Eroare preluarea istoricului: ", error);
        }
    };

    useEffect(() => {
        fetchUserIstoric();
    }, []);

    const updateBookRating = async (idCarte, newRating) => {
        if (!authData.token) return;
        
        setUpdatingRatings(prev => ({ ...prev, [idCarte]: true }));
        
        try {
            const response = await fetch(`${config.API_URL}/api/carte/${idCarte}/marcheazaCitita`, {
                method: "POST",
                headers: {  
                    "Authorization": `Bearer ${authData.token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ rating: newRating })
            });
            
            if (response.ok) {
                setIstoricData(prevData => 
                    prevData.map(item => 
                        item.idCarte === idCarte 
                            ? { ...item, scor: newRating } 
                            : item
                    )
                );
            }
        } catch (error) {
            console.log("Eroare la actualizarea rating-ului", error);
        } finally {
            setUpdatingRatings(prev => ({ ...prev, [idCarte]: false }));
        }
    };

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

    const StarRating = ({ currentRating, onRatingChange, isUpdating }) => {
        return (
            <div className="star-rating-container">
                <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= currentRating ? 'active' : ''} ${isUpdating ? 'updating' : ''}`}
                            onClick={() => !isUpdating && onRatingChange(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <div className="rating-text">
                    {currentRating > 0 ? `${currentRating}/5` : 'Fără rating'}
                </div>
            </div>
        );
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = istoricData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(istoricData.length / itemsPerPage);

    return (
        <div className="istoric-container">
            <h1 className="page-title">Istoricul tau de lectura</h1>
            
            <table className="tabel-istoric">
                <thead className="tabel-istoric-header">
                    <tr className="tabel-istoric-row">
                        <th className="tabel-istoric-head">Titlu</th>
                        <th className="tabel-istoric-head">Autor</th>
                        <th className="tabel-istoric-head">Rating</th>
                        <th className="tabel-istoric-head">Actiune</th>
                    </tr>
                </thead>
                <tbody className="tabel-istoric-body">
                    {currentItems.map((item) => (
                        <tr className="tabel-istoric-row" key={item.idIstoric}>
                            <td className="tabel-istoric-data tabel-titlu" onClick={() => {navigate(`/cauta/carte/${item.idCarte}`)}}>{item.titlu}</td>
                            <td className="tabel-istoric-data">{item.autor}</td>
                            <td className="tabel-istoric-data rating-cell">
                                <StarRating 
                                    currentRating={item.scor}
                                    onRatingChange={(newRating) => updateBookRating(item.idCarte, newRating)}
                                    isUpdating={updatingRatings[item.idCarte]}
                                />
                            </td>
                            <td className="tabel-istoric-data">
                                <button 
                                    className="tabel-istoric-buton" 
                                    onClick={() => fetchUnmark(item.idCarte)}
                                >
                                    Sterge
                                </button>
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
                        className={`pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IstoricLectura;
