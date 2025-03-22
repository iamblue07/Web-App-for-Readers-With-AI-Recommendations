import React, { useState, useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../context/GlobalState";
import config from "../../utils/config";
import MesajChat from "../MesajChat/MesajChat";
import "./ChatBazar.css";

const ChatBazar = ({ chatID }) => {
  const { authData } = useContext(GlobalContext);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessagesIDs, setChatMessagesIDs] = useState([]);
  const messagesEndRef = useRef(null);

  const fetchChatMessagesIDs = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/chat/getChatMessagesIDs`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatID })
      });
      if (!response.ok) return;
      const data = await response.json();
      setChatMessagesIDs(data);
    } catch (error) {
      console.log(error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessagesIDs]);

  useEffect(() => {
    fetchChatMessagesIDs();
  }, []);

  return (
    <div className="ChatBazar-main-container">
      <div className="ChatBazar-messages">
        {chatMessagesIDs.map((message) => (
          <MesajChat key={message.id} idMesaj={message.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="ChatBazar-sendMessage">
        <input
          type="text"
          className="ChatBazar-inputMessage"
          placeholder="Tasteaza..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="ChatBazar-btn-Incarca">Incarca</button>
        <button className="ChatBazar-btn-Trimite">Trimite</button>
      </div>
    </div>
  );
};

export default ChatBazar;