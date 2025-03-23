import React, {useState, useContext, useEffect} from "react";
import { useLocation } from "react-router-dom";
import ChatBazar from "../components/ChatBazar/ChatBazar";
import ListaChaturi from "../components/ListaChaturi/ListaChaturi";
import "../styles/ConversatiileMele.css";
const ConversatiileMele = ({}) => {

    const [currentChat, setCurrentChat] = useState(0);
    const location = useLocation();
    useEffect(()=>{

        const chatID = location.state?.chatID || 0;
        setCurrentChat(chatID);
    },[])

    return (
        <div className="ConversatiileMele-main-container">
            <div className="ConversatiileMele-left-container">
                <ListaChaturi setCurrentChat={setCurrentChat}/>
            </div>
            <div className="ConversatiileMele-right-container">
                <ChatBazar chatID={currentChat}/>
            </div>
        </div>
    )
}

export default ConversatiileMele;