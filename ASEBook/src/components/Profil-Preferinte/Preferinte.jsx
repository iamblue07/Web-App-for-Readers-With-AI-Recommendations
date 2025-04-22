import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from '../../context/GlobalState';
import config from '../../utils/config.js';
import text from '../../utils/text.js';
import { createToast } from '../../utils/createToast';
import "./Preferinte.css";

const Preferinte = ({ userId, isAdmin, canMountDashboard, setCanMountDashboard, mountIstoric, setMountIstoric }) => {
    const { authData } = useContext(GlobalContext);
    const [utilizatorPreferinte, setUtilizatorPreferinte] = useState(["", "", "", "", ""]);
    const [showPreferinte, setShowPreferinte] = useState(false)


    const fetchUpdateUtilizatorPreferinte = async () => {
        const token = authData?.token;
        if(!token) {
            return;
        }
        try {
            const response = await fetch(`${config.API_URL}/updateUtilizatorPreferinte`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authData.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({newPreferinte: utilizatorPreferinte})
            })
            if(!response.ok){
                createToast(`Eroare: ${response.statusText}`, false);
                return false;
            } else {
                createToast("Preferintele au fost actualizate cu succes!", true);
                return true;
            }
        }catch(error) {
            createToast("Eroare la actualizarea preferintelor!", false);
            return;
        }
    }

    const fetchUtilizatorPreferinte = async () => {
        const token = authData?.token;
        if (!token) {
            return;
        }
        try {
            const response = await fetch(`${config.API_URL}/${userId}/getUtilizatorPreferinte`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authData.token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                createToast("Eroare la incarcarea preferintelor utilizatorului!", false);
                return;
            }
            const data = await response.json();
    
            if (!data) {
                createToast("Eroare: preferintele au sosit goale!", false);
                return;
            }
    
            setUtilizatorPreferinte([
                data.PreferintaUnu || "",
                data.PreferintaDoi || "",
                data.PreferintaTrei || "",
                data.PreferintaPatru || "",
                data.PreferintaCinci || ""
            ]);
        } catch (error) {
            console.error("Error fetching user preferences: ", error);
        } finally {
            setShowPreferinte(true);
        }
    };

    useEffect(() => {
        if (authData?.token && userId) {
            fetchUtilizatorPreferinte();
        }
    }, [authData?.token, userId]);
    

    const genuriLiterare = text.genuriLiterare

    const togglePreferinta = (gen) => {
        setUtilizatorPreferinte((prev) => {
            const index = prev.indexOf(gen);
            if (index !== -1) {
                const newPreferinte = [...prev];
                newPreferinte[index] = "";
                return newPreferinte;
            } else {
                const emptyIndex = prev.indexOf("");
                if (emptyIndex !== -1) {
                    const newPreferinte = [...prev];
                    newPreferinte[emptyIndex] = gen;
                    return newPreferinte;
                } else {
                    createToast("Poti selecta doar 5 preferinte!", false);
                    return prev;
                }
            }
        });
    };

    let canScrape = true;
    const fetchStartScraping = async () => {
        canScrape = false;
        try {
            const response = await fetch(`${config.API_URL}/scraper/startScraping`, {
                method: "GET",
            });
        }catch(error){
            console.log(error);
        }
    }

    return (
        <div className="preferinte-container">
            <h2>Preferintele utilizatorului</h2>
            { showPreferinte ? (
                <div className="preferinte-table-container">
                <table className="tabel-preferinte">
                    <thead>
                        <tr>
                            <th className="th-preferinte">Gen Literar</th>
                            <th className="th-preferinte">Preferinta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {genuriLiterare.map((gen, index) => (
                            <tr className="tr-preferinte" key={index}>
                                <td className="td-preferinte">{gen}</td>
                                <td className="td-preferinte">
                                    <span 
                                        className={`preferinta ${utilizatorPreferinte.includes(gen) ? 'prefer' : 'nu-prefer'}`} 
                                        onClick={() => togglePreferinta(gen)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {utilizatorPreferinte.includes(gen) ? '✅ Prefer' : '❌ Nu prefer'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>) :(
                    <p>Please wait...</p>
                )
            }
            <button className="buton-Actualizeaza" onClick={()=> {fetchUpdateUtilizatorPreferinte()}}>Actualizeaza preferintele</button>
            <button className="buton-preferinte" onClick={()=> {setMountIstoric(!mountIstoric)}}>Vezi istoricul cartilor citite</button>
            {isAdmin && (<button className="buton-preferinte" onClick={() => {setCanMountDashboard(!canMountDashboard)}}>Vezi dashboard rapoarte</button>)}
        </div>
    );
};

export default Preferinte;
