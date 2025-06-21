import React, { useState, useContext} from "react";
import "./MeniuRecomandariAI.css";
import config from "../../utils/config";
import { createToast } from "../../utils/createToast";
import { GlobalContext } from "../../context/GlobalState";
import { ToastContainer } from "react-toastify";

const MeniuRecomandariAI = ({setBookIds, setTotalPages}) => {
  const [selectedSentiment, setSelectedSentiment] = useState("neutral");
  const [searchWords, setSearchWords] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { authData } = useContext(GlobalContext)

  const translatedEmotions = {
    "Fericire": "joy",
    "Suparare": "anger",
    "Dezgust": "disgust",
    "Infiorator": "fear",
    "Tristete": "sadness",
    "Surprinzator": "surprise",
    "Neutru": "neutral"
  };

  const handleSentimentSelect = (emotion) => {
    const value = translatedEmotions[emotion];
    setSelectedSentiment(prev => prev === value ? "neutral" : value);
  };

  const handleLoadRecommendations = async () => {
    try {
        const response = await fetch(`${config.API_URL}/api/getRecomandariCarti`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${authData.token}`,
                "Content-Type": "application/json"
            }
        })
        if(!response.ok) {
            createToast("Eroare la incarcarea recomandarilor!", false);
            return;
        }
        const data = await response.json();

        if (data.recommendedBookIds) {
            setBookIds(data.recommendedBookIds);
            const count = data.recommendedBookIds.length;
            const totalPages = Math.floor(count / 16) + 1;
            setTotalPages(totalPages)
        } else if (data.message) {
            createToast(data.message, true);
        }
    } catch(error) {
        console.error(error);
    }
  }

  const handleGenerateRecommendations= async () => {
    try {

        const payload = {
            query: searchWords,
            top_k: 16,
            sentiment: selectedSentiment
            };

        setIsLoading(true);
        const response = await fetch(
          `${config.RECOMMENDER_API}/api/request-recommendations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authData.token}`
            },
            body: JSON.stringify(payload)
          }
        );
        if (!response.ok) {
            createToast("Eroare la generarea recomandărilor!", false);
            return;
        }
        createToast("Recomandari generate cu succes!", true);
        await handleLoadRecommendations();
        setIsLoading(false);
    }catch(error) {
        console.error(error);
    }
  }

  const handleAnalyzeProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch (`${config.API_URL}/generateRecommendationsForProfile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        }
      });
      if(!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        return;
      }
      await handleLoadRecommendations();
      setIsLoading(false);
    }catch(error) {
      console.log(error);
    }
  }

  return (
    <div className="recomandari-container">
        <ToastContainer/>
      <input
        type="text"
        className="keyword-input"
        placeholder="Introdu cuvinte-cheie"
        value={searchWords}
        onChange={(e) => setSearchWords(e.target.value)}
      />

      <h3 className="emotion-prompt">Tonul emotional:</h3>
      
      <div className="emotions-scroll-wrapper">
        <div className="emotions-list">
          {Object.keys(translatedEmotions).map((emotion) => (
            <div 
              key={emotion}
              className={`emotion-item ${
                selectedSentiment === translatedEmotions[emotion] ? "selected" : ""
              }`}
              onClick={() => handleSentimentSelect(emotion)}
            >
              <div className="emotion-checkbox">
                {selectedSentiment === translatedEmotions[emotion] && (
                  <div className="checkmark" />
                )}
              </div>
              <span>{emotion}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-wrapper">
          <div className="loading-spinner" />
          <p>Se genereaza recomandari...</p>
        </div>
      ) : (
        <div className="buttons-wrapper">
          <button className="btnGenereaza" onClick={ () => {handleGenerateRecommendations()}}>
            Genereaza dupa optiuni
          </button>
          <button className="btnGenereaza" onClick={() => {handleAnalyzeProfile()}}>
            Genereaza dupa profil
          </button>
          <button className="btnIncarcaRecAI" onClick={() => {handleLoadRecommendations()}}>
            Afiseaza recomandarile
          </button>
        </div>
      )}
    </div>
  );
};

export default MeniuRecomandariAI;