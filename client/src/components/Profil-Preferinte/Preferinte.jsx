import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from '../../context/GlobalState.jsx';
import config from '../../utils/config.js';
import text from '../../utils/text.js';
import { createToast } from '../../utils/createToast.js';
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

    const [canScrape, setCanScrape] = useState(false)
    const fetchStartScraping = async () => {
        setCanScrape(false);
        try {
            const response = await fetch(`${config.API_URL}/scraper/startScraping`, {
                method: "GET",
            });
        }catch(error){
            console.log(error);
        }
    }

    const [canGenerateEmbeddings, setCanGenerateEmbeddings] = useState(false)
    const fetchGenerateEmbeddings = async () => {
        setCanGenerateEmbeddings(false);
        if(canGenerateEmbeddings) {
            try {
                const response = await fetch(`${config.RECOMMENDER_API}/api/initialize-vector-store`, {
                    method:"GET",
                    headers: {
                        "Authorization": `Bearer ${authData.token}`,
                        "Content-Type": "application/json"
                    }
                });
            }catch(error) {
                console.log(error);
            }
        }

    }

    return (
        <div className="preferinte-profil-container">
            <h2>Preferintele utilizatorului</h2>
            { showPreferinte ? (
                <div className="preferinte-profil-table-container">
                <table className="tabel-profil-preferinte">
                    <thead>
                        <tr>
                            <th className="th-gen-literar">Gen Literar</th>
                            <th className="th-preferinta">Preferinta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {genuriLiterare.map((gen, index) => (
                            <tr className="tr-preferinte" key={index}>
                                <td className="td-gen-literar">{gen}</td>
                                <td className="td-preferinta">
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
            <button className="buton-preferinte" onClick={()=> {fetchUpdateUtilizatorPreferinte()}}>Actualizeaza preferintele</button>
            <button className="buton-preferinte" onClick={()=> {setMountIstoric(!mountIstoric)}}>{!mountIstoric ? 'Vezi ' : 'Ascunde '}istoricul cartilor citite</button>
            {isAdmin && (<button className="buton-preferinte" onClick={() => {setCanMountDashboard(!canMountDashboard)}}>{!canMountDashboard ? 'Vezi ' : 'Ascunde '}dashboard rapoarte</button>)}
            {canScrape && isAdmin && <button className="buton-preferinte" onClick={() => fetchStartScraping()}>Start scraping</button>}
            {canGenerateEmbeddings && isAdmin && <button className="buton-preferinte" onClick={() => fetchGenerateEmbeddings()}>Generate Embeddings</button>}
        </div>
    );
};

export default Preferinte;
