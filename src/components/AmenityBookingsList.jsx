import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaCheck, FaTimes, FaMoneyBillWave, FaCalendarAlt, FaUserTie, FaConciergeBell} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const AmenityBookingsList = () => {
    const { bookingId } = useParams();
    const [guestData, setGuestData] = useState(null);
    const [amenityBookings, setAmenityBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewAvailabilities, setReviewAvailabilities] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Пользователь не авторизован");
            setLoading(false);
            return;
        }

        const decodedToken = jwtDecode(token);
        axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`)
            .then((response) => {
                setGuestData(response.data.guest);
            })
            .catch((err) => {
                setError("Ошибка загрузки данных гостя");
                console.error(err);
            });
    }, []);

    useEffect(() => {
        if (!bookingId) return;

        axios.get(`http://localhost:5221/api/amenity-bookings/${bookingId}/details/room-booking`)
            .then(response => {
                setAmenityBookings(response.data);
                setLoading(false);

                response.data.forEach(booking => {
                    if (booking.completionStatus === "Принята") {
                        checkReviewAvailability(booking.id);
                    }
                });

            })
            .catch((err) => {
                console.log(`Ошибка получения забронированных дополнительных услуг: ${err.message}`);
                setError(err);
                setLoading(false);
            });
    }, [bookingId]);

    const handleConfirmationAmenityBooking = async (amenityId) => {
        try {
            await axios.patch(`http://localhost:5221/api/amenity-bookings/${amenityId}/${guestData.id}/confirmation-amenity`);
            const response = await axios.get(`http://localhost:5221/api/amenity-bookings/${bookingId}/details/room-booking`);
            setAmenityBookings(response.data);
        } catch (err) {
            setError("Ошибка при подтверждении услуги");
            console.error(err);
        }
    };

    const getStatus = (booking) => {
        if (booking.completionStatus === "Принята") return { text: "Принята", icon: <FaCheck />, color: "#27ae60" };
        if (booking.completionStatus === "Задача выполнена") return { text: "Ожидает подтверждения", icon: <FaCheck />, color: "#3498db" };
        return { text: booking.completionStatus || "Неизвестный статус", icon: <FaTimes />, color: "#7f8c8d" };
    };

    const checkReviewAvailability = async (amenityBookingId) => {
        try {
            const response = await axios.get(`http://localhost:5221/api/amenity-reviews/${amenityBookingId}/availability`);
            setReviewAvailabilities(prev => ({
                ...prev,
                [amenityBookingId]: response.data
            }));
        } catch (err) {
            console.error("Ошибка при проверке доступности отзыва:", err);
            setReviewAvailabilities(prev => ({
                ...prev,
                [amenityBookingId]: false
            }));
        }
    };

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
                <p style={{ color: "red" }}>Ошибка: {error.message || error}</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Дополнительные услуги для бронирования #{bookingId}</h1>

            {amenityBookings.length === 0 ? (
                <div className="no-bookings">
                    <FaConciergeBell size={50} />
                    <p>Нет забронированных дополнительных услуг</p>
                </div>
            ) : (
                amenityBookings.map((booking) => {
                    const status = getStatus(booking);

                    return (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <div className="hotel-info">
                                    <h2>{booking.amenityName}</h2>
                                </div>
                                <div className="booking-status" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                                    {status.icon} {status.text}
                                </div>
                            </div>

                            <div className="booking-details">
                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <p className="detail-value">
                                            {new Date(booking.orderDate).toLocaleDateString()} в {booking.orderTime}
                                        </p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaUserTie />
                                    </div>
                                    <div>
                                        <p className="detail-value">
                                            {booking.employeeName || "Сотрудник не назначен"}
                                        </p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="detail-value">
                                            {booking.totalAmount} ₽ (×{booking.quantity})
                                        </p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        {booking.isPayd ? <FaCheck color="#27ae60" /> : <FaTimes color="#e74c3c" />}
                                    </div>
                                    <div>
                                        <p className="detail-value" style={{ color: booking.isPayd ? "#27ae60" : "#e74c3c" }}>
                                            {booking.isPayd ? "Оплачено" : "Не оплачено"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="booking-actions">
                                {!booking.isPayd && (
                                    <Link
                                        to={`/amenity-payment/${booking.id}`}
                                        className="btn btn-primary"
                                    >
                                        Оплатить
                                    </Link>
                                )}

                                {booking.completionStatus === "Задача выполнена" && (
                                    <button
                                        onClick={() => handleConfirmationAmenityBooking(booking.id)}
                                        className="btn btn-success"
                                    >
                                        Принять услугу
                                    </button>
                                )}

                                {booking.completionStatus === "Принята" && reviewAvailabilities[booking.id] && (
                                    <Link
                                        to={`/amenity-review/${booking.id}/${booking.amenityId}`}
                                        className="btn btn-secondary"
                                    >
                                        Оставить отзыв
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })
            )}

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                    font-weight: 600;
                    font-size: 28px;
                }

                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                    font-size: 40px;
                    margin-bottom: 15px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .no-bookings {
                    text-align: center;
                    padding: 40px 20px;
                    background-color: #f8f9fa;
                    border-radius: 10px;
                    margin-top: 20px;
                }

                .no-bookings p {
                    margin: 15px 0;
                    color: #6c757d;
                }

                .booking-card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin-bottom: 25px;
                    border-left: 4px solid #2980b9;
                    transition: transform 0.2s ease;
                }

                .booking-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .booking-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .hotel-info h2 {
                    font-size: 1.4rem;
                    color: #2c3e50;
                    margin: 0 0 5px 0;
                }

                .booking-status {
                    padding: 8px 15px;
                    border-radius: 18px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .booking-details {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 20px 0;
                }

                .detail-item {
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                }

                .icon-wrapper {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7f8c8d;
                    margin-top: 3px;
                }

                .detail-value {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #2d3436;
                    margin: 0;
                }

                .booking-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                    padding-top: 20px;
                    border-top: 1px solid #ecf0f1;
                    flex-wrap: wrap;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2980b9;
                }

                .btn-success {
                    background-color: #27ae60;
                    color: white;
                }

                .btn-success:hover {
                    background-color: #219653;
                }

                .btn-secondary {
                    background-color: #bdc3c7;
                    color: #2d3436;
                }

                .btn-secondary:hover {
                    background-color: #95a5a6;
                    color: white;
                }

                .error-message {
                    background-color: #fdecea;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: center;
                }

                @media (max-width: 600px) {
                    .booking-actions {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AmenityBookingsList;