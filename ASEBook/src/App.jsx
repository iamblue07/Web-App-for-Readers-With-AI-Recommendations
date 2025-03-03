import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import Login from './pages/Login';
import Forumuri from './pages/Forumuri';
import Cauta from './pages/Cauta';
import DespreNoi from './pages/DespreNoi';
import Contact from './pages/Contact';
import Profil from './pages/Profil';
import Acasa from './pages/Acasa';
import Bazar from './pages/Bazar';
import Forum from './components/Forum/Forum';
import DetaliiCarte from './pages/DetaliiCarte';
import { GlobalContext } from './context/GlobalState';

const App = () => {
    const navigate = useNavigate();
    const { authData } = useContext(GlobalContext);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/' && authData.userId !== 0) {
            navigate(`/acasa`);
        }
    }, [location, authData, navigate]);

    return (
        <div className="main-container">
            <div className="header">ASEBook</div>
            <div className="navbar">
                <button onClick={() => navigate(`/Acasa`)}>Acasa</button>
                <button onClick={() => navigate(`/forumuri`)}>Forumuri</button>
                <button onClick={() => navigate(`/bazar`)}>Bazar</button>
                <button onClick={() => navigate(`/cauta`)}>Cauta</button>
                <button onClick={() => navigate(`/despre-noi`)}>Despre Noi</button>
                <button onClick={() => navigate(`/contact`)}>Contact</button>
                {authData.token === null ? (
                    <button onClick={() => navigate(`/conecteaza-te`)}>Conecteaza-te</button>
                ) : (
                    <button onClick={() => navigate(`/profil`)}>Profil</button>
                )}
            </div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Acasa />} />
                    <Route path="/forumuri" element={<Forumuri />} />
                    <Route path="/bazar" element={<Bazar />} />
                    <Route path="/cauta" element={<Cauta />} />
                    <Route path="/despre-noi" element={<DespreNoi />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/profil" element={<Profil />} />
                    <Route path="/conecteaza-te" element={<Login />} />
                    <Route path="acasa" element={<Acasa />} />
                    <Route path="/forumuri" element={<Forumuri />} />
                    <Route path="/bazar" element={<Bazar />} />
                    <Route path="/cauta" element={<Cauta />} />
                    <Route path="/cauta/carte/:idCarte" element={<DetaliiCarte />} />
                    <Route path="/despre-noi" element={<DespreNoi />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/profil" element={<Profil />} />
                    <Route path='/forumuri/:idForum' element={<Forum/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default App;