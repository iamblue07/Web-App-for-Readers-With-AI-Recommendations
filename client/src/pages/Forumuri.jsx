import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import config from "../utils/config";
import { createToast } from '../utils/createToast';
import '../styles/Forumuri.css';

import { GlobalContext } from "../context/GlobalState";
import RaportareButon from "../components/RaportareButon/RaportareButon";
import LoadingScreen from "../components/Incarcare/Incarcare";

const rowsPerPage = 10;

const Forumuri = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [forums, setForums] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const { authData } = useContext(GlobalContext);

    const [isCreatingForum, setIsCreatingForum] = useState(false)
    const [newForumTitle, setNewForumTitle] = useState("")
    const [userHasRights, setUserHasRights] = useState(true)
    const [userHasReportRights, setUserHasReportRights] = useState(true);

    const [dataFullyLoaded, setDataFullyLoaded] = useState(false);

    const navigate = useNavigate()
    
    const fetchForums = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/getForumuri?page=${currentPage}&limit=${rowsPerPage}&search=${searchTerm}`);
            if (!response.ok) {
                console.log(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setForums(data.forums || []);
            setTotalPages(data.totalPages || 1);
            setDataFullyLoaded(true);
        } catch (error) {
            console.error("Eroare la preluarea forumurilor:", error);
            setForums([]);
            setTotalPages(1);
        }
    };
    
    const fetchCreateForum = async () => {
        if(!authData?.token) {
            return;}
        try {
            const response = await fetch(`${config.API_URL}/api/createForum`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({newForumTitle})
            })
            if (!response.ok) {
                console.error(`Error: ${response.status} ${response.statusText}`);
                createToast(`Eroare: ${response.statusText}`, false);
                return;
            }
            if(response.ok) {
                createToast("Forum creat!", true)
                setNewForumTitle('');
                setIsCreatingForum(false)
                fetchForums();
            }
        } catch(error) {
            createToast(error, false);
        }
    }

    const fetchUserRights = async () => {
        if(!authData?.token) {
            return;}
        try {
            const response = await fetch(`${config.API_URL}/api/getForumRights`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
            })
            if(!response.ok) {
                createToast("Eroare la verificarea drepturilor!", false);
                setUserHasRights(false);
            }
            if(response.ok){
                const data = await response.json();
                setUserHasReportRights(data.hasReportRights);
                setUserHasRights(data.hasRights);
            }

        } catch(error) {
            createToast(error, false);
            setUserHasRights(false);
        }
    } 

    useEffect(() => {
        fetchForums();
        fetchUserRights();
    }, [currentPage, searchTerm]);


    if(!dataFullyLoaded) {
        return (
            <LoadingScreen/>
        )
    }

    return (
        <div className="forum-container">
    <ToastContainer />
    <div className="search-section">
      <div className="search-box">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Cauta un forum..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {authData.token !== null && (
        <div className="forum-actions">
          <button 
            className={`action-btn ${isCreatingForum ? 'cancel-btn' : 'create-btn'}`}
            onClick={() => setIsCreatingForum(!isCreatingForum)}
          >
            {isCreatingForum ? (
              <><i className="fas fa-times"></i>Anuleaza</>
            ) : (
              <><i className="fas fa-plus"></i>Creeaza forum nou</>
            )}
          </button>
          
          <button 
            className="action-btn view-btn"
            onClick={() => navigate('/forumuri/ForumurileMele')}
          >
            <i className="fas fa-user"></i> Forumurile tale
          </button>
        </div>
      )}
    </div>

    {isCreatingForum ? (
      <div className="create-forum-section">
        {userHasRights ? (
          <div className="create-forum-card">
            <input 
              type="text" 
              className="create-input"
              placeholder="Introduceti titlul noului forum"
              value={newForumTitle}
              onChange={(e) => setNewForumTitle(e.target.value)}
            />
            <button className="submit-btn" onClick={fetchCreateForum}>
              <i className="fas fa-check"></i> Creeaza forum
            </button>
          </div>
        ) : (
          <div className="warning-card">
            <i className="fas fa-exclamation-triangle"></i>
            <p>În urma încălcării regulamentului, nu mai aveți drepturile de a crea un forum! Pentru detalii, contactați un administrator.</p>
          </div>
        )}
      </div>
    ) : (
      <>
        <div className="forums-grid">
          {forums.map(forum => (
            <div key={forum.id} className="forum-card">
            <div className="card-header">
                <h3 
                className="forum-title"
                onClick={() => navigate(`/forumuri/${forum.id}`)}
                >
                {forum.titluForum}
                </h3>
            </div>
            
            <div className="card-meta">
                <span className="creation-date">
                <i className="far fa-calendar"></i> {new Date(forum.data).toLocaleDateString()}
                </span>
                
                <div 
                className="author-info"
                onClick={() => navigate(`/utilizator/${forum.idUtilizator}`)}
                >
                <span>{forum.username}</span>
                </div>
            </div>
            
            {userHasReportRights && (
                <div className="report-section">
                <div className="report-container">
                    <RaportareButon 
                    idObiect={forum.id} 
                    tipObiect={"Forum"} 
                    authData={authData}
                    />
                    <span className={`status-badge ${forum.esteDeschis ? 'open' : 'closed'}`}>
                    {forum.esteDeschis ? "Deschis" : "Închis"}
                    </span>
                </div>
                </div>
            )}
            </div>
          ))}
        </div>
        
        <div className="pagination-container">
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentPage(i + 1)}
              disabled={i + 1 === currentPage}
              className={`pagination-btn ${i + 1 === currentPage ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </>
    )}
        </div>
    );
};

export default Forumuri;
