import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWifi, FaSwimmingPool, FaSpa, FaUtensils, FaDumbbell, FaParking, FaSnowflake, FaConciergeBell } from "react-icons/fa";

const HotelDetail = () => {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [avgRating, setAvgRating] = useState(0);


    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await fetch(`http://localhost:5221/api/hotels`);
                if (!response.ok) throw new Error("Ошибка загрузки данных отеля");
                const data = await response.json();
                setHotel(data[0]);

                const reviewCountResponse = await fetch('http://localhost:5221/api/hotel-reviews/count');
                if (!reviewCountResponse.ok) throw new Error("Ошибка загрузки количества отзывов");
                const reviewCountData = await reviewCountResponse.json();
                setReviewCount(reviewCountData);

                const avgHotelRating = await fetch('http://localhost:5221/api/hotel-reviews/avg');
                if (!avgHotelRating.ok) throw new Error("Ошибка загрузки среднего рейтинга отеля");
                const avgHotelData = await avgHotelRating.json();
                setAvgRating(avgHotelData);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [hotelId]);

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p>Загрузка отеля...</p>
        </div>
    );

    if (error) return (
        <div className="error-message">
            <h2>Произошла ошибка</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
    );

    if (!hotel) return (
        <div className="error-message">
            <h2>Отель не найден</h2>
            <p>Попробуйте выбрать другой отель</p>
        </div>
    );

    return (
        <div className="hotel-detail-container">
            <Navbar />

            <header className="hotel-header">
                <img
                    src="src/images/hotels/hotel-image-1.jpg"
                    alt={hotel.name}
                    className="hotel-main-image"
                />
                <div className="hotel-title-overlay">
                    <h1>{hotel.name}</h1>
                    <div className="hotel-rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    className={i < Math.floor(avgRating) ? "star-filled" : "star-empty"}
                                />
                            ))}
                        </div>
                        <span className="rating-value">
                            {avgRating ? avgRating.toFixed(1) : "—"}/5
                        </span>
                    </div>
                    <p className="hotel-location">
                        <FaMapMarkerAlt/> {hotel.city}, {hotel.address}
                    </p>
                </div>
            </header>

            <main className="hotel-content">
                <div className="hotel-main-info">
                    <section className="hotel-description">
                        <h2>Об отеле</h2>
                        <p>{hotel.description}</p>
                    </section>

                    <section className="hotel-features">
                        <h2>Удобства отеля</h2>
                        <div className="features-grid">
                            <div className="feature">
                                <FaWifi />
                                <span>Бесплатный Wi-Fi</span>
                            </div>
                            <div className="feature">
                                <FaSwimmingPool />
                                <span>Бассейн</span>
                            </div>
                            <div className="feature">
                                <FaSpa />
                                <span>Спа-центр</span>
                            </div>
                            <div className="feature">
                                <FaUtensils />
                                <span>Ресторан</span>
                            </div>
                            <div className="feature">
                                <FaDumbbell />
                                <span>Фитнес-центр</span>
                            </div>
                            <div className="feature">
                                <FaParking />
                                <span>Парковка</span>
                            </div>
                            <div className="feature">
                                <FaSnowflake />
                                <span>Кондиционеры</span>
                            </div>
                            <div className="feature">
                                <FaConciergeBell />
                                <span>Консьерж</span>
                            </div>
                        </div>
                    </section>

                    <section className="hotel-gallery">
                        <h2>Галерея</h2>
                        <div className="gallery-grid">
                            <img src="src/images/hotels/hotel-image-1.jpg" alt="Фото отеля 1" />
                            <img src="src/images/hotels/hotel-image-2.jpg" alt="Фото отеля 2" />
                        </div>
                    </section>
                </div>

                <aside className="hotel-sidebar">

                    <div className="hotel-contacts">
                        <h3>Контактная информация</h3>
                        <div className="contact-item">
                            <FaPhone />
                            <span>{hotel.phoneNumber}</span>
                        </div>
                        <div className="contact-item">
                            <FaEnvelope />
                            <span>{hotel.email}</span>
                        </div>
                        <div className="contact-item">
                            <FaMapMarkerAlt />
                            <span>{hotel.city}, {hotel.address}</span>
                        </div>
                        <div className="contact-item">
                            <FaClock />
                            <span>Круглосуточно</span>
                        </div>
                    </div>

                    <Link to={`/hotels/${hotel.id}/rooms`} className="rooms-btn">
                        Посмотреть номера
                    </Link>

                    <Link to={`/hotels/${hotel.id}/reviews`} className="rooms-btn">
                        Просмотреть отзывы ({reviewCount})
                    </Link>
                </aside>
            </main>

            <style jsx>{`
                .hotel-detail-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    width: 100%;
                }
                
                .hotel-header {
                    position: relative;
                    left: 50%;
                    right: 50%;
                    margin-left: -50vw;
                    margin-right: -50vw;
                    width: 100vw;
                    height: 600px;
                    overflow: hidden;
                }
                
                .hotel-main-image {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: brightness(0.7);
                }
                
                .hotel-title-overlay {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    padding: 2rem;
                    color: white;
                    text-align: center;
                }

                body {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }
                
                .hotel-title-overlay h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    text-align: center;
                }
                
                .hotel-rating {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 1rem;
                }
                
                .stars {
                    display: flex;
                    gap: 3px;
                    align-items: center;
                }
                
                .star-filled {
                    color: #ffd700;
                    margin-top: auto;
                }
                
                .star-empty {
                    color: #ccc;
                    margin-top: auto;
                }
                
                .rating-value {
                    font-weight: bold;
                    margin-top: auto;
                }
                
                .hotel-location {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    justify-content: center;
                }
                
                .hotel-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                    padding: 30px 20px;
                }
                
                .hotel-main-info {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                
                .hotel-description h2,
                .hotel-features h2,
                .hotel-gallery h2 {
                    font-size: 1.8rem;
                    margin-bottom: 1rem;
                    color: #2c3e50;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #3498db;
                }
                
                .hotel-description p {
                    line-height: 1.6;
                    color: #555;
                }
                
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                }
                
                .feature {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: #f5f5f5;
                    border-radius: 5px;
                }
                
                .feature svg {
                    color: #3498db;
                    font-size: 1.2rem;
                }
                
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 15px;
                }
                
                .gallery-grid img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 8px;
                    transition: transform 0.3s ease;
                }
                
                .gallery-grid img:hover {
                    transform: scale(1.03);
                }
                
                .hotel-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                
                .hotel-quick-info {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                }
                
                .hotel-quick-info h3 {
                    margin-bottom: 15px;
                    color: #2c3e50;
                }
                
                .hotel-quick-info ul {
                    list-style: none;
                    padding-left: 0;
                }
                
                .hotel-quick-info li {
                    margin-bottom: 10px;
                }
                
                .hotel-contacts {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                }
                
                .hotel-contacts h3 {
                    margin-bottom: 15px;
                    color: #2c3e50;
                }
                
                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .contact-item svg {
                    color: #3498db;
                }
                
                .rooms-btn {
                    display: block;
                    text-align: center;
                    background: #3498db;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: bold;
                    transition: background 0.3s ease;
                }
                
                .rooms-btn:hover {
                    background: #2980b9;
                }
                
                .loading-screen {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                
                .spinner {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .error-message {
                    text-align: center;
                    padding: 40px;
                    color: #e74c3c;
                }
                
                .error-message button {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                
                @media (max-width: 768px) {
                    .hotel-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .hotel-title-overlay h1 {
                        font-size: 2rem;
                    }
                    
                    .features-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default HotelDetail;