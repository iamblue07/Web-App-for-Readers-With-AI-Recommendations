import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import stockimage from "../../assets/stock_book.jpg";
import config from "../../utils/config";
import Anunt from "../../components/Anunt/Anunt";

const CautaAnunturi = ({anunturiIds}) => {

    const [anuntData, setAnuntData] = useState({})
    const [imagePath, setImagePath] = useState(stockimage);
    const [anunturiDetails, setAnunturiDetails] = useState({});

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const fetchAnunturiBazarData = async (ids) => {
            if(ids.length === 0) return;
            try {
                const response = await fetch(`${config.API_URL}/api/bazar/getAnunturiData`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ids})
                });
                if(!response.ok) {
                    console.log("Eroare la preluarea detaliilor!");
                    return;
                }
                const data = await response.json();
                setAnunturiDetails(data);
                setIsDataLoaded(true);
            }catch(error){
                console.error("Error fetching anunturi details: ", error);
            }
        }

    useEffect(() => {
        fetchAnunturiBazarData(anunturiIds);
    },[])


    return (
        <div className="CautaAnunturi-main-container">
            {isDataLoaded === true && (
                <>{anunturiDetails.map((anunt) => (
                <Anunt className="anunt-card" key={anunt.id} {...anunt}/>))}
                </>
            )}

        </div>
    )
}

export default CautaAnunturi;