import React, {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../context/GlobalState";
import { createToast } from "../../utils/createToast";
import config from "../../utils/config";
import stock_book from "../../assets/stock_book.jpg";
import "./AnuntulMeu.css";
const AnuntulMeu = ({id, editingAnuntID, setEditingAnuntID}) => {

    const {authData} = useContext(GlobalContext);
    const navigate = useNavigate();

    const [anuntData, setAnuntData] = useState({});
    const [imagePath, setImagePath] = useState(stock_book);

    const [esteNegociabil, setEsteNegociabil] = useState(true);
    const [pretNou, setPretNou] = useState(0);
    
    useEffect( () => {
        if(!authData) {
            navigate("/bazar");
            return;
        }
        fetchAnuntData();
    }, [authData.token])

    const fetchAnuntData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/anunt/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`,
                }
            })
            if(!response.ok) {
                console.log("Eroare la preluarea datelor anuntului!");
                return;
            }
            const data = await response.json();
            setAnuntData(data);
            fetchAnuntImagine()
            setEsteNegociabil(anuntData.esteNegociabil);
        }catch(error){
            console.log(error);
        }
    }

    const fetchAnuntImagine = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/${id}/getAnuntImagine`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if(!response.ok) {
                console.error("Eroare la preluarea imaginii cartii.");
                return;
            }
            const contentType = response.headers.get("content-type");
            if(contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if(data.caleImagine) {
                    setImagePath(`${config.API_URL}/${data.caleImagine}`);
                }
            } else if(contentType && contentType.indexOf("image/") !== -1) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setImagePath(imageUrl);
            } else {
                console.error("Raspunsul nu este de tip JSON sau imagine");
            }
        }catch(error){
            console.error("Eroare la preluarea imaginii cartii: ", error);
        }
    }

    const fetchActualizeazaAnunt = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/updateAnunt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`,
                },
                body: JSON.stringify({id: id, pretNou: pretNou, esteNegociabil: esteNegociabil})
            })
            if(!response.ok) {
                createToast("Eroare la actualizarea anuntului!", false);
                return;
            }
            createToast("Anunt actualizat cu succes!", true);
            setAnuntData((prevData) => ({
                ...prevData,
                pretAnunt: pretNou
            }));
            setEditingAnuntID(0);
            
        } catch(error){
            console.error(error);
        }
    }

    const fetchInchideAnunt = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/InchideAnunt/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`,
                }
            })
            if(!response.ok){
                createToast("Eroare la inchiderea anuntului!", false);
                return;
            }
            setAnuntData((prevData) => ({
                ...prevData,
                esteDisponibil: false
            }));
            createToast("Anuntul a fost inchis cu succes!", true);
        }catch(error){
            console.error(error);
        }
    }

    const fetchStergeAnunt = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/StergeAnunt/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authData.token}`,
                }
            })
            if(!response.ok){
                createToast("Eroare la stergerea anuntului!", false);
                return;
            }
            createToast("Anuntul a fost sters cu succes!", true);
            setAnuntData(null);
        }catch(error){
            console.error(error);
        }
    }

    const  handleSchimbaPretButton = () => {
        setEditingAnuntID(id);
    }

    const handleAnuleazaPretButton = () => {
        setEditingAnuntID(0);
    }

    const handleSalveazaPretButton = () => {
        fetchActualizeazaAnunt();
    }

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) {
            e.preventDefault();
        }
    }

    const handlePretChange = (e) => {
        let value = e.target.value;
        if (value === "" || /^[0-9]+$/.test(value)) {
            setPretNou(value < 0 ? 0 : value);  
        }
    };

    return (
        <div className="AnuntulMeu-main-container">
            <div className="AnuntulMeu-left-container">
                <img className="AnuntulMeu-image" src={imagePath}/>
            </div>
            <div className="AnuntulMeu-right-container">
                <div className="AnuntulMeu-top-right-container">
                    <div className="AnuntulMeu-title-description">
                        <p className="AnuntulMeu-titlu">{anuntData.titluAnunt}</p>
                        <p className="AnuntulMeu-descriere">{anuntData.descriereAnunt}</p>
                    </div>
                    <div className="AnuntulMeu-side-buttons">
                        {anuntData.esteNegociabil ? (<p className="p-negociabil">Negociabil</p>) : (<p className="p-nonNegociabil">Nu e negociabil</p>)}
                            {!anuntData.esteDisponibil ? (<p className="AnuntulMeu-p-inchis">Anuntul este inchis!</p>) : (<button className="AnuntulMeu-inchide-button" onClick={()=>{fetchInchideAnunt()}} disabled={editingAnuntID !== 0}>Inchide Anuntul</button>)}

                            <button className="AnuntulMeu-sterge-button" onClick={() => {fetchStergeAnunt()}} disabled={editingAnuntID !== 0}>Sterge Anuntul</button>
                    </div>
                </div>
                <div className="AnuntulMeu-bottom-right-container">
                    {editingAnuntID === id ? (<>
                        <input
                            type="text"
                            placeholder="Introdu noul pret"
                            value={pretNou}
                            onInput={handleInputChange}
                            onChange={(e) => {handlePretChange(e)}}
                            className="AnuntulMeu-input"
                        />
                        {esteNegociabil ? 
                            (<button className="AnuntulMeu-negociabil-button" onClick={() => {setEsteNegociabil(!esteNegociabil)}}>Negociabil</button>) : 
                            (<button className="AnuntulMeu-nonNegociabil-button" onClick={() => {setEsteNegociabil(!esteNegociabil)}}>Nu e negociabil</button>)}
                        <button className="AnuntulMeu-salveaza-button" disabled={editingAnuntID !== id} onClick={() => {handleSalveazaPretButton()}}>Salveaza</button>
                        <button className="AnuntulMeu-anuleaza-button" disabled={editingAnuntID !== id} onClick={() => {handleAnuleazaPretButton()}}>Anuleaza</button>
                    </>) :(<div className="AnuntulMeu-pret-curent-schimba-buton">
                        <p className="AnuntulMeu-pret-curent">Pret: {anuntData.pretAnunt} RON</p>
                        <button className="AnuntulMeu-schimba-button" disabled={editingAnuntID !== 0} onClick={() => {handleSchimbaPretButton()}}>Schimba pretul</button>
                    </div>)}

                </div>
            </div>
        </div>
    )
}

export default AnuntulMeu;