import React, {useState, useContext, useEffect} from "react";
import config from "../../utils/config";
import { GlobalContext } from "../../context/GlobalState";
import stock_image from "../../assets/stock_book.jpg";
import "./ListaChaturi-Chat.css";
const Chat = ({idChat, setCurrentChat}) => {

    const [canDisplay, setCanDisplay] = useState(false);
    const {authData} = useContext(GlobalContext);

    const [chatData, setChatData] = useState({})
    const fetchChatData = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/chat/getChatData/${idChat}`, {
                method: "GET",
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`,
                },
            });
            if(!response.ok) {
                console.log("Eroare la preluarea datelor chatului!");
                return;
            }
            const data = await response.json();
            setChatData(data);
            setCanDisplay(true);
        }catch(error){
            console.log(error);
        }
    }

    const [anuntImage, setAnuntImage] = useState(stock_image);
    const fetchAnuntImagine = async () => {
        try{
            const response = await fetch(`${config.API_URL}/api/bazar/${chatData.idAnunt}/getAnuntImagine`, {
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
            if(contentType && contentType.indexOf("image/") !== -1) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setAnuntImage(imageUrl);
            } else {
                console.error("Raspunsul nu este de tip JSON sau imagine");
            }
        }catch(error) {
            console.log(error);
        }
    }

    useEffect(()=> {
        if(chatData.idAnunt) {
            fetchAnuntImagine();
        }
    },[chatData])

    useEffect(()=> {
        fetchChatData();
    },[])

    return(
        <div className="Chat-main-container" onClick={() => {setCurrentChat(idChat)}}>
            {canDisplay === true && 
            (<>
                <img src={anuntImage}
                className="Chat-anunt-imagine"/>
                <div className="Chat-titlu-nume-container">
                    <p className="Chat-titlu">{chatData.titluAnunt}</p>
                    {chatData.userVinde === true ? 
                        (<p className="Chat-nume">{chatData.cumparatorUsername}</p>) : 
                        (<p className="Chat-nume">{chatData.vanzatorUsername}</p>)}
                </div>
            </>)}
        </div>
    )
}

export default Chat;