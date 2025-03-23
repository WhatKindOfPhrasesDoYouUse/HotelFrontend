import { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import Navbar from "./Navbar.jsx";

const HotelList = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('http://localhost:5221/api/hotels');
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных об отеле');
                }
                const data = await response.json();
                setHotels(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="hotel-container">
            <Navbar />
            <h1 className="title">Отели</h1>
            <div className="hotel-list">
                {hotels.map(hotel => (
                    <div key={hotel.id} className="hotel-card">
                        <h3>{hotel.name}</h3>
                        <p><strong>Город:</strong> {hotel.city}</p>
                        <p><strong>Адрес:</strong> {hotel.address}</p>
                        <p><strong>Описание:</strong> {hotel.description}</p>
                        <p><strong>Рейтинг:</strong> {hotel.rating} / 5</p>
                        <p><strong>Тип отеля:</strong> {hotel.hotelType.name}</p>

                        <Link to={`/hotels/${hotel.id}/rooms`} className="button">
                            Посмотреть комнаты
                        </Link>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default HotelList;
