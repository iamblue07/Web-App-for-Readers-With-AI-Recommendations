import React, { createContext, useReducer, useEffect } from 'react';

const initialState = {
    authData: JSON.parse(localStorage.getItem('authData')) || { userId: 0, token: null },
};

const GlobalContext = createContext(initialState);

const globalReducer = (state, action) => {
    switch (action.type) {
        case 'SET_AUTH_DATA':
            return {
                ...state,
                authData: action.payload,
            };
        case 'CLEAR_AUTH_DATA':
            return {
                ...state,
                authData: { userId: 0, token: null },
            };
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