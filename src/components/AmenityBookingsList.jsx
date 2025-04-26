import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import {FaSpinner} from "react-icons/fa";

const AmenityBookingsList = () => {
    const {bookingId} = useParams();
    const [amenityBookings, setAmenityBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bookingId) return;

        axios.get(`http://localhost:5221/api/amenity-bookings/${bookingId}/room-booking`)
            .then(response => {
                setAmenityBookings(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(`Ошибка получения забронированныйх дополнительных услуг: ${err.message}`);
                setError(err);
            })
    })

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

    return  (
        <div>
            <Navbar />
            <h2>Забронированный услуги</h2>
            {amenityBookings.length > 0 ? (
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата заказа</th>
                            <th>Время заказа</th>
                            <th>Количество заказанных услуг</th>
                        </tr>
                    </thead>
                    <tbody>
                    {amenityBookings.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.orderDate}</td>
                            <td>{booking.orderTime}</td>
                            <td>{booking.completionStatus}</td>
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

export default AmenityBookingsList;