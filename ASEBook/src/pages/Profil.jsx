import React, { useContext, useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import "../styles/Profil.css";
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../context/GlobalState';
import config from '../utils/config';
import { createToast } from '../utils/createToast';
import stockimage from '../assets/stock.jpg';
import PreferinteComponent from '../components/Profil-Preferinte/Preferinte';
import IstoricLecturaComponent from '../components/Istoric-Lectura/Istoric-Lectura';
const Profil = () => {
    const { clearAuthData, authData } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newDescription, setNewDescription] = useState(userData.descriere || "");
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [isLoadingPassword, setIsLoadingPassword] = useState(false);  // State for loading status
    const [imagePath, setImagePath] = useState(stockimage);
    const [canMountPreferinte, setCanMountPreferinte] = useState(false);

    const [mountIstoric, setMountIstoric] = useState(false);


    const fetchUtilizatorData = async () => {
        const token = authData?.token;
        if (!token) {
            console.log('No token found');
            return;
        }
        try {
            const response = await fetch(`${config.API_URL}/auth/getUtilizatorData`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.error(`Error: ${response.status} ${response.statusText}`);
                createToast(`Eroare: ${response.statusText}`, false);
                return;
            }
            const data = await response.json();
            if (data && data.user) {
                setUserData(data.user);
                setNewDescription(data.user.descriere || "");
            } else {
                createToast("Eroare la preluarea datelor", false);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchUpdateDescriere = async () => {
        const token = authData?.token;
        if (!token) {
            console.log('No token found');
            return false;
        }
        try {
            const response = await fetch(`${config.API_URL}/auth/updateUtilizatorDescriere`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ descriere: newDescription })
            })
            if (!response.ok) {
                createToast(`Eroare: ${response.statusText}`, false);
                return false;
            } else {
                createToast("Descrierea a fost actualizata cu succes!", true);
                return true;
            }
        } catch (error) {
            console.error('Error updating user description:', error);
        }
    };

    const handleLogout = () => {
        clearAuthData();
        navigate("/acasa");
    };

    const handleSaveDescription = () => {
        const r = fetchUpdateDescriere();
        if (r === false) return;

        setUserData(prevState => ({
            ...prevState,
            descriere: newDescription
        }));
        setIsEditingDescription(false);
    };

    const handleCancelEdit = () => {
        setNewDescription(userData.descriere || "");
        setIsEditingDescription(false);
    };

    const FetchUpdatePassword = async () => {
        if (newPass.length < 8) {
            createToast("Noua parola trebuie sa aiba cel putin 8 caractere!", false);
            return;
        }
        if (newPass === currentPass) {
            createToast("Noua parola nu poate fi aceeasi cu vechea parola!", false);
            return;
        }

        setIsLoadingPassword(true);  // Set loading state to true

        try {
            const response = await fetch(`${config.API_URL}/auth/updateUtilizatorParolaHash`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldPassword: currentPass, newPassword: newPass })
            });

            if (!response.ok) {
                createToast(`Eroare: ${response.statusText}`, false);

            } else {
                createToast("Parola a fost actualizata cu succes!", true);
            }
        } catch (error) {
            createToast(error, false);
        } finally {
            setIsLoadingPassword(false);  // Reset loading state
            setCurrentPass("");
            setNewPass("");
        }
    };

    const fetchUserProfileImage = async () => {
        if (!authData?.token) return;

        try {
            const response = await fetch(`${config.API_URL}/${userData.id}/getImagineProfil`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authData.token}`,
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

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("image", file);
    
        try {
            const response = await fetch(`${config.API_URL}/auth/uploadImagineProfil`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authData.token}`,
                },
                body: formData,
            });
    
            if (!response.ok) {
                createToast("Eroare la încărcarea imaginii!", false);
                return;
            }
    
            createToast("Imaginea a fost actualizată cu succes!", true);
            fetchUserProfileImage();
        } catch (error) {
            console.error("Eroare la încărcarea imaginii:", error);
        }
    };
    

    useEffect(() => {
        const fetchData = async () => {
            await fetchUtilizatorData();
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        if (userData.id) {
            fetchUserProfileImage();
            setCanMountPreferinte(true);

        }
    }, [userData?.id]);
    

    return (
        <div className='big-container'>
            <ToastContainer />
            <div className='main-container-Profil'>
                <div className='container-Preferinte'>
                    {canMountPreferinte ? <PreferinteComponent userId = {userData.id} mountIstoric = {mountIstoric} setMountIstoric = {setMountIstoric}/> : <></>}
                </div>

                <div className='container-Profil'>
                    <div className='container-Imagine-Deconectare-Profil'>
                        <div className='container-Imagine-Profil'>
                            <img src={imagePath} alt="imagine-profil" className='imagine-profil' />
                            <input type="file" id="fileInput" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                            <button className='buton-Schimba' onClick={() => document.getElementById("fileInput").click()}>
                                Schimba imaginea
                            </button>
                        </div>
                        <p>Salut, {userData.username}</p>
                        <button className='buton-Deconectare' onClick={handleLogout}>Deconecteaza-te</button>
                    </div>
                    <div className='container-descriere-Profil'>
                        {
                            userData.descriere ? (
                                <p>{userData.descriere}</p>
                            ) : (
                                <>Lipsa descriere</>
                            )
                        }

                        {isEditingDescription ? (
                            <>
                                <textarea
                                    value={newDescription}
                                    onChange={(event) => { setNewDescription(event.target.value) }}
                                    placeholder="Introdu noua descriere"
                                    rows="4"
                                    className="textarea-profil"
                                />
                                <button className='buton-Schimba' onClick={handleSaveDescription}>Salveaza descrierea</button>
                                <button className='buton-Deconectare' onClick={handleCancelEdit}>Anuleaza</button>
                            </>
                        ) : (
                            <>
                                <button className='buton-Profil' onClick={() => setIsEditingDescription(true)}>Schimba descrierea!</button>
                            </>
                        )}
                    </div>
                    <div className='container-schimbare-parola'>
                        <div className='div-inputs'><p>Parola curenta:</p><input type='password' placeholder='Parola curenta' value={currentPass} onChange={(e) => { setCurrentPass(e.target.value) }} /></div>
                        <div className='div-inputs'><p>Parola Noua:</p><input type='password' placeholder='Parola noua' value={newPass} onChange={(e) => { setNewPass(e.target.value) }} /></div>
                        <button className='buton-Actualizeaza' onClick={FetchUpdatePassword} disabled={isLoadingPassword}>
                            {isLoadingPassword ? 'Se actualizeaza...' : 'Actualizeaza parola'}
                        </button>
                    </div>
                </div>
            </div>
            {mountIstoric && <div className='container-istoric'>
                <IstoricLecturaComponent/>
            </div>}
        </div>
    );
};

export default Profil;
