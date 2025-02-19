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

import { GlobalContext } from './context/GlobalState';

const App = () => {
    const navigate = useNavigate();
    const { authData } = useContext(GlobalContext);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/' && authData.userId !== 0) {
            navigate(`/utilizator/${authData.userId}`);
        }
    }, [location, authData, navigate]);

    return (
        <div className="main-container">
            <div className="header">ASEBook</div>
            <div className="navbar">
                <button onClick={() => navigate(`utilizator/${authData.userId}`)}>Acasa</button>
                <button onClick={() => navigate(`/utilizator/${authData.userId}/forumuri`)}>Forumuri</button>
                <button onClick={() => navigate(`/utilizator/${authData.userId}/bazar`)}>Bazar</button>
                <button onClick={() => navigate(`/utilizator/${authData.userId}/cauta`)}>Cauta</button>
                <button onClick={() => navigate(`/utilizator/${authData.userId}/despre-noi`)}>Despre Noi</button>
                <button onClick={() => navigate(`/utilizator/${authData.userId}/contact`)}>Contact</button>
                {authData.userId === 0 ? (
                    <button onClick={() => navigate(`/conecteaza-te`)}>Conecteaza-te</button>
                ) : (
                    <button onClick={() => navigate(`/utilizator/${authData.userId}/profil`)}>Profil</button>
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
                    <Route path="utilizator/:uid" element={<Acasa />} />
                    <Route path="/utilizator/:uid/forumuri" element={<Forumuri />} />
                    <Route path="utilizator/:uid/bazar" element={<Bazar />} />
                    <Route path="/utilizator/:uid/cauta" element={<Cauta />} />
                    <Route path="/utilizator/:uid/despre-noi" element={<DespreNoi />} />
                    <Route path="/utilizator/:uid/contact" element={<Contact />} />
                    <Route path="/utilizator/:uid/profil" element={<Profil />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;