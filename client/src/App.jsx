import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import Login from './pages/Login';
import Forumuri from './pages/Forumuri';
import Cauta from './pages/Cauta';
import DespreNoi from './pages/DespreNoi';
import Contact from './pages/Contact';
import ProfilPersonal from './pages/ProfilPersonal';
import Acasa from './pages/Acasa';
import Bazar from './pages/Bazar';
import Forum from './subpages/Forum';
import DetaliiCarte from './subpages/DetaliiCarte';
import ForumurileMele from './subpages/ForumurileMele';
import AnunturileMele from './subpages/AnunturileMele';
import CreeazaAnunt from './subpages/CreeazaAnunt';
import VeziAnunt from './subpages/VeziAnunt';
import ConversatiileMele from './subpages/ConversatiileMele';
import ProfilUtilizatori from './pages/ProfilUtilizatori';
import { GlobalContext } from './context/GlobalState';
import logo from './assets/AuroraCodex.png';
import Statistici from './subpages/Statistici';

const App = () => {
    const navigate = useNavigate();
    const { authData } = useContext(GlobalContext);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/' && authData.userId !== 0) {
            navigate(`/acasa`);
        }
    }, [location, authData, navigate]);

    useEffect(() => {
        const img = new Image();
        img.src = logo;
    
        img.onload = () => {
          setIsDataLoaded(true);
        };
    
        img.onerror = () => {
          console.error('Image failed to load.');
        };
      }, []);

    const [isDataLoaded, setIsDataLoaded] = useState(false);


    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    };

    const { pathname } = useLocation();
    const isActive = (path) => pathname.toLowerCase() === path.toLowerCase();


    if(isDataLoaded) {
        return <div className="main-container">
          <nav className="navbar">
            <div className="navbar-brand">
            <img src={logo} alt='Logo' className='navbar-logo'/>
            <span className='navbar-title'>Aurora Codex</span>
            <button className="navbar-toggle" onClick={toggleMenu}>
                <svg className="hamburger" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
            </button>
            </div>
    
            <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
            <div className="navbar-items">
                <button className={`nav-link ${isActive('/acasa') ? 'active' : ''}`} onClick={() => handleNavigation('/acasa')}>
                Acasa
                </button>
                <button className={`nav-link ${isActive('/forumuri') ? 'active' : ''}`} onClick={() => handleNavigation('/forumuri')}>
                Forumuri
                </button>
                <button className={`nav-link ${isActive('/bazar') ? 'active' : ''}`} onClick={() => handleNavigation('/bazar')}>
                Bazar
                </button>
                <button className={`nav-link ${isActive('/cauta') ? 'active' : ''}`} onClick={() => handleNavigation('/cauta')}>
                Cauta
                </button>
            </div>
            <div className="navbar-auth">
                {authData.token === null ? (
                <button className={`nav-link ${isActive('/conecteaza-te') ? 'active' : ''}`} onClick={() => handleNavigation('/conecteaza-te')}>
                    Conecteaza-te
                </button>
                ) : (
                <button className={`nav-link ${isActive('/profil') ? 'active' : ''}`} onClick={() => handleNavigation('/profil')}>
                    Profil
                </button>
                )}
            </div>
            </div>
        </nav>
      
        <div className="content">
          <Routes>
            <Route path="/" element={<Acasa />} />
            <Route path="/forumuri" element={<Forumuri />} />
            <Route path="/bazar" element={<Bazar />} />
            <Route path="/cauta" element={<Cauta />} />
            <Route path="/despre-noi" element={<DespreNoi />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profil" element={<ProfilPersonal />} />
            <Route path="/utilizator/:idUser" element={<ProfilUtilizatori/>}/>
            <Route path="/conecteaza-te" element={<Login />} />
            <Route path="acasa" element={<Acasa />} />
            <Route path="/bazar/creeaza-anunt" element={<CreeazaAnunt/>}/>
            <Route path='/bazar/AnunturileMele' element={<AnunturileMele/>}/>
            <Route path='/bazar/conversatii' element={<ConversatiileMele/>}/>
            <Route path='/bazar/anunt/:idAnunt' element={<VeziAnunt/>}/>
            <Route path="/cauta/carte/:idCarte" element={<DetaliiCarte />} />
            <Route path='/forumuri/:idForum' element={<Forum/>}/>
            <Route path='/forumuri/ForumurileMele' element={<ForumurileMele/>}/>
            <Route path='/statistici' element={<Statistici/>}/>
          </Routes>
        </div>
      </div>;
    } else {
        return (
            <p>Data loading...</p>
        )
    }

};

export default App;