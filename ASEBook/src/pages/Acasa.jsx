import React from 'react';
import text from "../utils/text.js";
import "../styles/Acasa.css";
import pictures from "../assets/AcasaPictures/AcasaPictures.js"

const Acasa = () => {
    return (
        <div className='main-container-Acasa'>
            <div className='containerOne'>
                <div className='container-texts'>
                    <div className='textTypeOne textBlock'>
                        {text.fillerTextOne}
                    </div>
                    <div className='textTypeTwo textBlock'>
                        {text.fillerTextTwo}
                    </div>
                </div>
                <img src={pictures.PictureOne} alt="Book on a table" className='pictureOne'/>
            </div>
           
            <div className='textTypeOne textThree textBlock'>
                {text.fillerTextThree}
            </div>

            <div className='containerTwo'>
                <img src={pictures.PictureTwo} alt="Library" className='pictureTwo'/>
                <div className='container-texts'>
                    <div className='textTypeTwo textBlock'>
                        {text.fillerTextFour}
                    </div>
                    <div className='textTypeOne textBlock'>
                        {text.fillerTextFive}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Acasa;