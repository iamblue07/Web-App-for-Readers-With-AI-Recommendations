import React, {useState, useContext, useEffect} from "react";
import config from "../../utils/config";
import { GlobalContext } from "../../context/GlobalState";
import Chat from "../ListaChaturi-Chat/ListaChaturi-Chat";

const ListaChaturi = ({setCurrentChat}) => {

    const [canDisplay, setCanDisplay] = useState(false);
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
            setChatIDs(data);
            setCanDisplay(true);
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=> {
        fetchChatIDs();
    },[])

    return (
        <div>
            {canDisplay === true && (
                <>
                {chatIDs.map((ID) => (
                    <Chat key={ID} idChat={ID} setCurrentChat={setCurrentChat}/>
                ))}
                </>
            )}

        </div>
    )
}

export default ListaChaturi;