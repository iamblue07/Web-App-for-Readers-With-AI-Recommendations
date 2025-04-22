import React, {useContext} from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../context/GlobalState";
import "./HeaderBazar.css";
const HeaderBazar = () => {

    const {authData} = useContext(GlobalContext);
    const navigate = useNavigate();

    return (
        <>
            {authData.token && <div className='connected-menu'>
                <button className='btn-creaza-anunt' onClick={() => {navigate('/bazar/creeaza-anunt')}}>Publica un anunt</button>
                <button className='btn-vezi-anunturi' onClick={() => {navigate('/bazar/AnunturileMele')}}>Vezi anunturile tale</button>
                <button className='btn-conversatii' onClick={() => {navigate('/bazar/conversatii', {state: {chatID: 0}})}}>Vezi conversatiile</button>
            </div>}
        </>
    )
}

export default HeaderBazar;