import React, {useState, useContext, useEffect} from "react";
import config from "../../utils/config";
import { GlobalContext } from "../../context/GlobalState";
import Chat from "../ListaChaturi-Chat/ListaChaturi-Chat";
import LoadingScreen from "../Incarcare/Incarcare";

const ListaChaturi = ({setCurrentChat}) => {

    const [canDisplay, setCanDisplay] = useState(false);
    const [chatIDs, setChatIDs] = useState([]);
    const {authData} = useContext(GlobalContext);
    const [dataFullyLoaded, setDataFullyLoaded] = useState(false);

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
            setDataFullyLoaded(true);
        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=> {
        fetchChatIDs();
    },[])

    if(!dataFullyLoaded) {
        return (
            <LoadingScreen/>
        )
    }

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