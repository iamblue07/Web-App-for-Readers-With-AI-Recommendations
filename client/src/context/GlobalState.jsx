import React, { createContext, useReducer, useEffect } from 'react';
import {jwtDecode} from "jwt-decode";

const getAuthData = () => {
    const storedData = JSON.parse(localStorage.getItem('authData'));

    if (storedData?.token) {
        try {
            const decoded = jwtDecode(storedData.token);
            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('authData');
                return { token: null };
            }
        } catch (error) {
            console.error("Eroare la decodificarea tokenului:", error);
            return { token: null };
        }
    }
    return storedData || { token: null };
};

const initialState = {
    authData: getAuthData(),
};

const GlobalContext = createContext(initialState);

const globalReducer = (state, action) => {
    switch (action.type) {
        case 'SET_AUTH_DATA':
            return { ...state, authData: action.payload };
        case 'CLEAR_AUTH_DATA':
            return { ...state, authData: { token: null } };
        default:
            return state;
    }
};

const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    useEffect(() => {
        if (state.authData.token) {
            localStorage.setItem('authData', JSON.stringify(state.authData));
        } else {
            localStorage.removeItem('authData');
        }
    }, [state.authData]);

    // 🔴 Verifică expirarea tokenului periodic
    useEffect(() => {
        const checkTokenExpiration = () => {
            if (state.authData.token) {
                try {
                    const decoded = jwtDecode(state.authData.token);
                    if (decoded.exp * 1000 < Date.now()) {
                        console.log("Token expirat. Utilizator deconectat.");
                        dispatch({ type: 'CLEAR_AUTH_DATA' });
                    }
                } catch (error) {
                    console.error("Eroare la verificarea expirării tokenului:", error);
                    dispatch({ type: 'CLEAR_AUTH_DATA' });
                }
            }
        };

        // Verifică imediat la pornirea aplicației
        checkTokenExpiration();

        // Setează un interval pentru a verifica la fiecare 60 de secunde
        const interval = setInterval(checkTokenExpiration, 60000);

        return () => clearInterval(interval);
    }, [state.authData.token]);

    const setAuthData = (data) => {
        dispatch({ type: 'SET_AUTH_DATA', payload: data });
    };

    const clearAuthData = () => {
        dispatch({ type: 'CLEAR_AUTH_DATA' });
    };

    return (
        <GlobalContext.Provider value={{ authData: state.authData, setAuthData, clearAuthData }}>
            {children}
        </GlobalContext.Provider>
    );
};

export { GlobalContext, GlobalProvider };
