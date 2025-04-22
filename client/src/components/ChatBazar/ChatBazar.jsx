import React, { useState, useContext, useEffect, useRef } from "react";
import { ToastContainer } from 'react-toastify';
import { createToast } from "../../utils/createToast";
import { GlobalContext } from "../../context/GlobalState";
import config from "../../utils/config";
import MesajChat from "../MesajChat/MesajChat";
import "./ChatBazar.css";

const ChatBazar = ({ chatID }) => {

  const [canDisplay, setCanDisplay] = useState(false);

  const { authData } = useContext(GlobalContext);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessagesIDs, setChatMessagesIDs] = useState([]);
  const messagesEndRef = useRef(null);

  const fetchChatMessagesIDs = async () => {
    if(chatID !== 0) {
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
        setCanDisplay(true);
      } catch (error) {
        console.log(error);
      }
    }

  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessagesIDs]);

  useEffect(() => {
    if(chatID !== 0) {
      fetchChatMessagesIDs();
      checkIsOpen();
    }
  }, [chatID]);

  const fetchSendMessage = async () => {
    if (!newMessage || !newMessage.trim()) {
      createToast("Mesajul nu poate fi gol!", false);
      return;
    }
    try{
      const response = await fetch(`${config.API_URL}/api/chat/sendMessage`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatID, newMessage })
      })
      if(!response.ok) {
        createToast("Eroare: Mesajul nu s-a putut trimite!", false);
        return;
      } else {
        createToast("Mesaj trimis!", true);
        setNewMessage("");
        fetchChatMessagesIDs();
      }
    }catch(error){
      console.log(error);
    }
  } 

  const fetchSendMedia = async (event) => {
    const file = event.target.files[0];
    if(!file)  {
      return;
    }
    const formData = new FormData();
    formData.append("media", file);
    formData.append("chatID", chatID);
    try{
      const response = await fetch(`${config.API_URL}/api/chat/uploadMedia`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authData.token}`,
        },
        body: formData,
    })
    if(!response.ok) {
      createToast("Eroare: Fisierul nu a fost trimis!", false);
      return;
    }
    createToast("Fisierul a fost trimis!", true);
    fetchChatMessagesIDs();
    }catch(error){
      console.log(error);
    }
  }

  const [isOpen, setIsOpen] = useState(true);
  const checkIsOpen = async () => {
    try{
      const response = await fetch(`${config.API_URL}/api/chat/checkIsOpen/${chatID}`,{
        method:"GET"
      });
      if(!response.ok){
        console.log("Eroare la verificarea statusului chatului!");
        return;
      }
      const data = await response.json();
      setIsOpen(data.isOpen);
    }catch(error){
      console.log(error);
    }
  }

  const fetchOpenCloseChat = async () => {
    try{
      const response = await fetch(`${config.API_URL}/api/chat/openCloseChat/${chatID}`,{
        method:"GET",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${authData.token}`
        }
      });
      if(!response.ok){
        console.log("Eroare la inchiderea sau deschiderea chatului!");
        return;
      }
      const data = await response.json();
      if(data.success === true) {
        createToast("Status chat schimbat cu succes!", true);
        setIsOpen(!isOpen);
        return;
      }
      createToast("Eroare: vanzatorii nu pot inchide sau inchide chatul!", false);
    }catch(error){
      console.log(error);
    }
  }

  return (
    <div className="ChatBazar-main-container">
      <ToastContainer/>
      {chatID !== 0 ? (<>{canDisplay === true && (
        <>
          <div className="ChatBazar-messages">
              {chatMessagesIDs.map((message) => (
                <MesajChat key={message.id} idMesaj={message.id} />
              ))}
              <div ref={messagesEndRef} />
          </div>
          {isOpen && (
            <div className="ChatBazar-sendMessage">
              <input
                type="text"
                className="ChatBazar-inputMessage"
                placeholder="Tasteaza..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <input type="file" id="fileInput" accept="image/*" style={{ display: "none" }} onChange={fetchSendMedia} />
              <button className="ChatBazar-btn-Incarca" onClick={() => document.getElementById("fileInput").click()}>Incarca</button>
              <button className="ChatBazar-btn-Trimite" onClick={()=>{fetchSendMessage()}}>Trimite</button>
            </div>
          )}
          {isOpen ? (<button className="chatBazar-btn-Inchide" onClick={()=>{fetchOpenCloseChat()}}>Inchide chatul</button>) : (
            <button className="chatBazar-btn-Deschide" onClick={()=>{fetchOpenCloseChat()}}>Deschide chatul</button>
          )}

        </>
      )}</>):(<p>Aici poti vedea conversatiile tale...
      </p>)}




    </div>
  );
};

export default ChatBazar;