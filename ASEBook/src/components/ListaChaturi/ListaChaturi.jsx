import React, {useState, useContext, useEffect} from "react";
import config from "../../utils/config";
import { GlobalContext } from "../../context/GlobalState";
const ListaChaturi = () => {

    const [chatIDs, setChatIDs] = useState([]);
    const {authData} = useContext(GlobalContext);

    const fetchChatIDs = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/getChatIDs`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });
            if(!response.ok) {
                console.log("Eroare la preluarea ID-urilor Chaturilor!");
                return;
            }
            const data = await response.json();
            console.log("Chat IDs", data);
            setChatIDs(data);
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=> {
        fetchChatIDs();
    },[])

    return (
        <div>

        </div>
    )
}

export default ListaChaturi;