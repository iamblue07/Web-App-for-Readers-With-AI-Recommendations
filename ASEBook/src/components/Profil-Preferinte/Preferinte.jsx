import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from '../../context/GlobalState';
import config from '../../utils/config.js';
import { createToast } from '../../utils/createToast';
import "./Preferinte.css";

const Preferinte = ({ userId }) => {
    const { authData } = useContext(GlobalContext);
    const [utilizatorPreferinte, setUtilizatorPreferinte] = useState(["", "", "", "", ""]);
    const [showPreferinte, setShowPreferinte] = useState(false)


    const fetchUpdateUtilizatorPreferinte = async () => {
        const token = authData?.token;
        if(!token) {
            console.log("No token found");
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
            console.log("No token found");
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
            console.log("Preferintele utilizatorului:", data); // Verifică ce primești
    
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
    }, [authData?.token, userId]);  // Reexecută efectul doar când authData sau userId se schimbă
    

    const genuriLiterare = [
        "AUDIOBOOKS", 'CULINARE', 'ARTA,ARHITECTURA', 'ENCICLOPEDII', 'BIOGRAFII, MEMORII, JURNALE',
        'LINGVISTICA, DICTIONARE', 'LIMBI STRAINE', 'POEZIE, TEATRU, STUDII LITERARE',
        'FICTIUNE', 'BENZI DESENATE', 'GHIDURI SI HARTI TURISTICE, ATLASE', 'ISTORIE', 'RELIGIE', 'FILOSOFIE',
        'PSIHOLOGIE', 'STIINTE SOCIALE. POLITICA', 'MARKETING SI COMUNICARE', 'BUSINESS SI ECONOMIE',
        'DREPT', 'MEDICINA', 'STIINTE EXACTE. MATEMATICI', 'NATURA SI MEDIU', 'TEHNICA SI TEHNOLOGIE',
        'COMPUTERE SI INTERNET', 'SANATATE, DEZVOLTARE PERSONALA', 'LIFESTYLE, SPORT, TIMP LIBER', 'PENTRU COPII, ADOLESCENTI',
        'ROMANIA', 'SOFT EDUCATIONAL'
    ];

    const togglePreferinta = (gen) => {
        setUtilizatorPreferinte((prev) => {
            const index = prev.indexOf(gen);
            if (index !== -1) {
                // Deselectăm preferința și o înlocuim cu ""
                const newPreferinte = [...prev];
                newPreferinte[index] = "";
                return newPreferinte;
            } else {
                // Verificăm dacă există un slot gol
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

    return (
        <div className="preferinte-container">
            <h2>Preferințele utilizatorului</h2>
            { showPreferinte ? (
                <div className="preferinte-table-container">
                <table className="tabel-preferinte">
                    <thead>
                        <tr>
                            <th className="th-preferinte">Gen Literar</th>
                            <th className="th-preferinte">Preferință</th>
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
            <button className="buton-preferinte" onClick={()=> {fetchUpdateUtilizatorPreferinte()}}>Actualizeaza preferintele</button>
        </div>
    );
};

export default Preferinte;
