import React, {useState, useEffect, useContext} from "react";
import {useParams} from "react-router-dom";
import config from "../../utils/config";
import "./Carte.css";
import stockimage from "../../assets/stock_book.jpg";

const Carte = (carteData) => {

    return (
        <div className="book-main-container">
                <div className="image-container">
                    <img
                    src={
                        carteData.caleImagineAbsoluta
                        ? `${config.API_URL}${carteData.caleImagineAbsoluta}`
                        : stockimage
                    }
                    alt={"Book image"}
                    className="bookImage"/>
            </div>
            <div className="details-container">
                <p className="titlu">{carteData.titlu}</p>
                <p className="autor">{carteData.autor}</p>
                <p className="pret">Începând de la:{carteData.pretMinim}</p>
            </div>
        </div>
    )
}

export default Carte;