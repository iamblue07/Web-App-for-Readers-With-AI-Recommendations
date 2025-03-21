import React, {useState, useEffect, useContext} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import config from "../../utils/config";
import stock_book from "../../assets/stock_book.jpg";

const VeziAnunt = () => {

    const {authData} = useContext(GlobalContext);
    const navigate = useNavigate();
    const {idAnunt} = useParams();
    const [anuntData, setAnuntData] = useState({});
    const [imagePath, setImagePath] = useState(stock_book);

    const fetchAnuntData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/anunt/${idAnunt}`, {
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
        try {
            const response = await fetch(`${config.API_URL}/api/bazar/${idAnunt}/getAnuntImagine`, {
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
        } catch(error) {
            console.error("Eroare la preluarea imaginii cartii: ", error);      
        }
    }

    useEffect(() => {
        fetchAnuntData();
    }, [])

    return(
        <>
        </>
    )
}

export default VeziAnunt;