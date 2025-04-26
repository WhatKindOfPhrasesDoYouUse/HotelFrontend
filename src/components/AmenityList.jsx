import {Link, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import {FaSpinner, FaTrash} from "react-icons/fa";

const AmenityList = () => {
    const {bookingId} = useParams();
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5221/api/amenities/${bookingId}/room-booking`)
            .then((response) => {
                setAmenities(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(`Ошибка при получении данных дополнительных услуг: ${err.message}`);
                setLoading(false);
            })
    }, []);

    console.log(amenities);

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка дополнительных услуг...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="error-message">
                <p style={{ color: "red" }}>Ошибка: {error}</p>
            </div>
        </div>
    );

    return (
        <div>
            <Navbar />
            <h2>Дополнительные услуги для бронирования #{bookingId}</h2>
            {amenities.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Цена за единицу</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {amenities.map(amenities => (
                            <tr key={amenities.id}>
                                <td>{amenities.id}</td>
                                <td>{amenities.name}</td>
                                <td>{amenities.description || 'Описание отсутствует'}</td>
                                <td>{amenities.unitPrice}</td>
                                <td>
                                    <Link to={`/amenity-booking/${amenities.id}/${bookingId}`}>
                                        Заказать
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p></p>
            )}
        </div>
    )
}

export default AmenityList;