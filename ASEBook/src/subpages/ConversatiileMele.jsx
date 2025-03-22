import React, {useState, useContext, useEffect} from "react";
import ChatBazar from "../components/ChatBazar/ChatBazar";
import ListaChaturi from "../components/ListaChaturi/ListaChaturi";
import "../styles/ConversatiileMele.css";
const ConversatiileMele = () => {

    const [currentChat, setCurrentChat] = useState(1);

    return (
        <div className="ConversatiileMele-main-container">
            <div className="ConversatiileMele-left-container">
                <ListaChaturi/>
            </div>
            <div className="ConversatiileMele-right-container">
                <ChatBazar chatID={currentChat}/>
            </div>
        </div>
    )
}

export default ConversatiileMele;