import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import text from "../utils/text.js";
import "../styles/Acasa.css";
import pictures from "../assets/AcasaPictures/AcasaPictures.js";
import Carte from '../components/Carte/Carte.jsx';
import LoadingScreen from '../components/Incarcare/Incarcare.jsx';
import config from '../utils/config.js';
import Citate from "../components/Citate/Citate.jsx";

const Acasa = () => {
    const [bookIDs, setBookIDs] = useState([]);
    const [booksDetails, setBooksDetails] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [dataFullyLoaded, setDataFullyLoaded] = useState(false);
    const navigate = useNavigate();
    
    // Carousel scrolling state
    const carouselRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollTimeout, setScrollTimeout] = useState(null);

    const fetchRandomBooksIDs = async () => {
        try {
            console.log(config.API_URL);
            const response = await fetch(`${config.API_URL}/api/getRandomBooks`);
            console.log(response.status);
            if (!response.ok) return;
            const { ids } = await response.json();
            setBookIDs(ids);
            await getBooksDetails(ids);
            setIsDataLoaded(true);
        } catch (error) {
            console.error(error);
        }
    };

    const getBooksDetails = async (ids) => {
        if (!ids.length) return;
        try {
            const response = await fetch(`${config.API_URL}/api/postCartiData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) return;
            const data = await response.json();
            setBooksDetails(data);
            setDataFullyLoaded(true);
        } catch (error) {
            console.error("Error fetching book details:", error);
        }
    };

    // Handle scroll events to pause animation while user is scrolling
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const handleScroll = () => {
            setIsScrolling(true);
            
            // Clear any existing timeout
            if (scrollTimeout) clearTimeout(scrollTimeout);
            
            // Set a new timeout to resume animation after scrolling stops
            const newTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 500);
            
            setScrollTimeout(newTimeout);
        };

        carousel.addEventListener('scroll', handleScroll);
        
        return () => {
            carousel.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };
    }, [scrollTimeout]);

    useEffect(() => {
        fetchRandomBooksIDs();
    }, []);

    if (!isDataLoaded || !dataFullyLoaded) {
        return <LoadingScreen />;
    }

    const trackItems = [...booksDetails, ...booksDetails];

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
                <img src={pictures.PictureOne} alt="Book on a table" className='pictureOne' />
            </div>
            
            <Citate/>
            
            <section className="book-carousel-section">
                <div 
                    className="book-carousel"
                    ref={carouselRef}
                >
                    <div className={`book-carousel-track ${isScrolling ? 'paused' : ''}`}>
                        {trackItems.map((book, idx) => (
                            <Carte key={`${book.id}-${idx}`} {...book} />
                        ))}
                    </div>
                </div>
            </section>

            <div className='containerTwo'>
                <img src={pictures.PictureTwo} alt="Library" className='pictureTwo' />
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
};

export default Acasa;