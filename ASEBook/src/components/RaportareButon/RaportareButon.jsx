import react, {useState, useEffect, useContext} from 'react';
import { createToast } from '../../utils/createToast';
import config from '../../utils/config';
import "./RaportareButon.css";

const RaportareButon = ({idObiect, tipObiect, authData}) => {

    const [descriereRaport, setDescriereRaport] = useState("");
    const [showRaportMeniu, setShowRaportMeniu] = useState(false);

    const fetchCreateReport = async() =>{
        try{
            if(!descriereRaport.trim().length > 0) {
                createToast("Descrie problema intampinata!", false);
            }
            else {
                const response = await fetch(`${config.API_URL}/api/raport/creeazaRaport`, {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":`Bearer ${authData.token}`
                    },
                    body: JSON.stringify({idObiect, tipObiect, descriereRaport})
                });
                if(!response.ok) {
                    createToast("Eroare la crearea raportului!", false);
                    return;
                }
                setShowRaportMeniu(false);
                setDescriereRaport("");
                createToast("Raport creat!", true);
                
            }
        }catch(error){
            console.log(error);
        }
    }


    return(<div className='RaportareButon-main-container'>
      <button className='RaportareButon-showButton' onClick = {()=>{setShowRaportMeniu(true)}} disabled={showRaportMeniu}>Raporteaza</button>
      {showRaportMeniu && (
        <div>
          <input type="text" placeholder="Motivul raportarii" value={descriereRaport} onChange={(e)=>{setDescriereRaport(e.target.value)}}/>
          <button className='RaportareButton-ReportButton' onClick = {() => {fetchCreateReport()}} disabled = {!showRaportMeniu}>Raporteaza</button>
          <button className='RaportareButton-CancelButton' onClick = {()=>{setShowRaportMeniu(false)}} disabled = {!showRaportMeniu}>Anuleaza</button>
        </div>
      )}
    </div>)
}

export default RaportareButon;