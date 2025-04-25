import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { createToast } from '../utils/createToast';
import { useParams } from 'react-router-dom';
import config from '../utils/config';
import stockimage from '../assets/stock.jpg';
import "../styles/ProfilUtilizatori.css";
import Anunt from '../components/Anunt/Anunt';
const ProfilUtilizatori = () => {
    const {idUser} = useParams();
    const navigate = useNavigate();

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [dataExists, setDataExists] = useState(true);

    const [viewPreferences, setViewPreferences] = useState(false);
    const [viewRestrictions, setViewRestrictions] = useState(false);
    const [userData, setUserData] = useState({});
    const [imagePath, setImagePath] = useState(stockimage);

    const [forumsLoaded, setForumsLoaded] = useState(false);
    const [viewForums, setViewForums] = useState(false);
    const [userForums, setUserForums] = useState([]);

    const [articlesLoaded, setArticlesLoaded] = useState(false);
    const [viewArticles, setViewArticles] = useState(false);
    const [userArticles, setUserArticles] = useState([]);




    const fetchUserProfileImage = async () => {
        try {
            const response = await fetch(`${config.API_URL}/${idUser}/getImagineProfil`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Eroare la preluarea imaginii profilului.");
                return;
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                if (data.caleImagine) {
                    setImagePath(`${config.API_URL}/${data.caleImagine}`);
                }
            } else if (contentType && contentType.indexOf("image/") !== -1) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setImagePath(imageUrl);
            } else {
                console.error("Răspunsul nu este de tip JSON sau imagine.");
            }
        } catch (error) {
            console.error("Eroare la preluarea imaginii profilului:", error);
        }
    };

    const getUserData = async () => {
        try {
            const response = await fetch(`${config.API_URL}/getProfile/${idUser}`);
            if(!response.ok) {
                setDataExists(false);
                return;
            }
            setDataExists(true);
            const data = await response.json();
            if(data) {
                setUserData(data);
                await fetchUserProfileImage();
                console.log(data);
                setIsDataLoaded(true);
            }


        }catch(error) {
            console.log(error);
        }
    }

    const getUserArticles = async () => {
        try{
            const response = await fetch(`${config.API_URL}/getUserArticles/${idUser}`);
            if(!response.ok) {
                createToast("Eroare la preluarea articolelor!", false);
                setArticlesLoaded(false);
                return;
            }
            const articles = await response.json();
            if(articles) {
                setUserArticles(articles);
                console.log(articles);
                setArticlesLoaded(true);
            }
        }catch(error){
            setArticlesLoaded(false);
            console.log(error);
        }
    }

    const getUserForums = async () => {
        try{
            const response = await fetch(`${config.API_URL}/getUserForums/${idUser}`);
            if(!response.ok) {
                createToast("Eroare la preluarea forumurilor!", false);
                setForumsLoaded(false);
                return;
            }
            const forums = await response.json();
            if(forums) {
                setUserForums(forums);
                console.log(forums);
                setForumsLoaded(true);
            }
        }catch(error){
            setForumsLoaded(false);
            console.log(error);
        }
    }


    const handleGettingForums = async () => {
        if(userForums.length === 0) {
            getUserForums();
        }
        setViewForums(!viewForums);
    }



    const handleGettingArticles = () => {
        if (userArticles.length === 0){
            getUserArticles();
        }
        setViewArticles(!viewArticles);
    }

    const handleRestrictions = () => {
        return (
            <>
                {!userData.user.poateCreaAnunt && (<p className='rights'>Nu poate crea anunturi.</p>)}
                {!userData.user.poateCreaForum && (<p className='rights'>Nu poate crea forumuri.</p>)}
                {!userData.user.poateTrimiteMesaj && (<p className='rights'>Nu poate trimite mesaje.</p>)}
                {userData.user.poateCreaAnunt && userData.user.poateCreaForum && userData.user.poateTrimiteMesaj && 
                (<p className='rights'>Utilizatorul nu este restrictionat</p>)}
            </>
        )
    }

    useEffect(()=>{
        setImagePath(stockimage);
        setViewArticles(false);
        setViewForums(false);
        setViewPreferences(false);
        setViewRestrictions(false);
        getUserData();
        setUserArticles([])
        setUserForums([])
    },[idUser])

    if(!isDataLoaded) {
        return (
            <p>Data loading...</p>
        )
    } else {
        return (
            <div className='ProfilUtilizatori-main-container'>
                <ToastContainer/>
                {!dataExists ? (<p>Error: missing data</p>) :
                (
                 <div className='ProfilUtilizatori-data'>
                    <div className='ProfilUtilizatori-top-row'>
                        <p className='ProfilUtilizatori-p'>Data inregistrarii: {new Date(userData.user.dataInregistrare).toLocaleString()}</p>
                    </div>
                    <div className='ProfilUtilizatori-user'>
                        <div className='ProfilUtilizatori-image'>
                            <img src={imagePath}/>
                            {userData.user.esteAdministrator && <p className='admin-p'>Admin</p>}
                        </div>
                        <p className='ProfilUtilizatori-p'>{userData.user.username}</p>
                    </div>
                    <div className='ProfilUtilizatori-descriere'>
                        <p className='ProfilUtilizatori-p'>{userData.user.descriere}</p>
                    </div>
                    <div className='ProfilUtilizatori-preferinte-dropdown' onClick={() => {setViewPreferences(!viewPreferences)}}>
                        <div className='spans-div'>
                            <span>Genuri Literare Preferate</span>
                            <span className={`sageta ${viewPreferences ? "rotated" : ""}`}>&#9660;</span>
                        </div>
                        {viewPreferences && (
                            <div className='preferinte-container'>
                                <table className='preferinte-table'>
                                    <tbody>
                                        {userData.preferences.length > 0 ? (
                                            userData.preferences.map((pref, index) => (
                                            <tr key={index}>
                                                <td>{pref}</td>
                                            </tr>
                                            ))
                                        ) : (
                                            <tr>
                                            <td colSpan="1">Fara preferinte</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className='ProfilUtilizatori-articles-dropdown' onClick={() => {handleGettingArticles()}}>
                        <div className='spans-div'>
                            <span>Anunturile utilizatorului</span>
                            <span className={`sageta ${viewArticles ? "rotated" : ""}`}>&#9660;</span>
                        </div>
                        {viewArticles && (
                            <div className='articles-container'>
                                    {userArticles.length !== 0 ? (
                                        userArticles.map((anunt, index) => (
                                            <Anunt className="anunt-card" key={anunt.id} {...anunt} />
                                        ))
                                    ): (<p>Utilizatorul nu a publicat anunturi in bazar.</p>)}
                            </div>
                        )}
                    </div>
                    <div className='ProfilUtilizatori-forums-dropdown' onClick={() => {handleGettingForums()}}>
                        <div className='spans-div'>
                            <span>Forumurile utilizatorului</span>
                            <span className={`sageta ${viewForums ? "rotated" : ""}`}>&#9660;</span>
                        </div>
                        {viewForums && (
                            <div className='forums-container'>
                                {userForums.length !== 0 ? (
                                    userForums.map((forum, index) => (
                                        <div className='forum-row'>
                                            <p className='forumTitle' onClick={() => navigate(`/forumuri/${forum.id}`)}>{forum.titluForum}</p>
                                            {forum.esteDeschis ? (<p className='forumOpen'>Deschis</p>) : (<p className='forumClosed'>Inchis</p>)}
                                        </div>
                                    ))
                                ) : (
                                    <p>Utilizatorul nu a creat forumuri pana acum.</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className='ProfilUtilizatori-restrictions-dropdown' onClick={() => {setViewRestrictions(!viewRestrictions)}}>
                        <div className='spans-div'>
                            <span>Drepturi retrase</span>
                            <span className={`sageta ${viewRestrictions ? "rotated" : ""}`}>&#9660;</span>
                        </div>
                        {viewRestrictions && (
                            <div className='restrictions-container'>
                                {handleRestrictions()}
                            </div>
                        )}
                    </div>
                </div>   
                )}
            </div>
        )
    }
}

export default ProfilUtilizatori;