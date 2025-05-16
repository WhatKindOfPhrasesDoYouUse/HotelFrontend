import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";
import { Link } from "react-router-dom";
import { FaSpinner, FaHotel, FaCalendarAlt, FaUser, FaMoneyBillWave, FaTimes, FaCheck, FaClock } from "react-icons/fa";

const RoomBookingsList = () => {
    const [roomBookings, setRoomBookings] = useState([]);
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmationTimeLeft, setConfirmationTimeLeft] = useState({});
    const [paymentTimeLeft, setPaymentTimeLeft] = useState({});
    const [reviewsAvailability, setReviewsAvailability] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        const decodedToken = jwtDecode(token);
        axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`)
            .then((response) => {
                setGuestId(response.data.guest?.id);
                setLoading(false);
            })
            .catch((err) => {
                setError(`Ошибка при получении данных гостя: ${err.message}`);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!guestId) return;

        axios.get(`http://localhost:5221/api/room-bookings/${guestId}/guest`)
            .then(async (response) => {
                const bookings = response.data;
                setRoomBookings(bookings);

                const availabilityMap = {};
                for (const booking of bookings) {
                    if (booking.isPayd && booking.isConfirmed) {
                        availabilityMap[booking.roomBookingId] = await checkReviewAvailability(booking.roomBookingId);
                    }
                }
                setReviewsAvailability(availabilityMap);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setRoomBookings([]);
                    return;
                }
                setError(`Ошибка при загрузке данных забронированных комнат: ${err.message}`);
                setRoomBookings([]);
            });
    }, [guestId]);

    useEffect(() => {
        if (!guestId) return;

        const interval = setInterval(() => {
            axios.get(`http://localhost:5221/api/room-bookings/${guestId}/guest`)
                .then((response) => {
                    setRoomBookings(response.data);
                })
                .catch((err) => {
                    if (err.response && err.response.status === 404) {
                        setRoomBookings([]);
                        return;
                    }
                    setError(`Ошибка при обновлении списка: ${err.message}`);
                });
        }, 15000);

        return () => clearInterval(interval);
    }, [guestId]);

    useEffect(() => {
        const interval = setInterval(() => {
            const updatedConfirmationTimers = {};
            const updatedPaymentTimers = {};

            roomBookings.forEach((booking) => {
                if (!booking.isPayd && !booking.isConfirmed && booking.createdAt) {
                    const createdAt = new Date(booking.createdAt);
                    const deadline = new Date(createdAt.getTime() + 15 * 60 * 1000);
                    const now = new Date();
                    const diff = deadline - now;

                    if (diff > 0) {
                        const minutes = Math.floor(diff / 60000);
                        const seconds = Math.floor((diff % 60000) / 1000);
                        updatedConfirmationTimers[booking.roomBookingId] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    } else {
                        updatedConfirmationTimers[booking.roomBookingId] = "время истекло";
                    }
                }

                if (booking.isConfirmed && !booking.isPayd && booking.confirmationTime) {
                    const confirmationTime = new Date(booking.confirmationTime);
                    const paymentDeadline = new Date(confirmationTime.getTime() + 15 * 60 * 1000);
                    const now = new Date();
                    const diff = paymentDeadline - now;

                    if (diff > 0) {
                        const minutes = Math.floor(diff / 60000);
                        const seconds = Math.floor((diff % 60000) / 1000);
                        updatedPaymentTimers[booking.roomBookingId] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    } else {
                        updatedPaymentTimers[booking.roomBookingId] = "время истекло";
                    }
                }
            });

            setConfirmationTimeLeft(updatedConfirmationTimers);
            setPaymentTimeLeft(updatedPaymentTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [roomBookings]);

    const getStatus = (booking) => {
        if (booking.isConfirmed && booking.isPayd) return { text: "Подтверждено", icon: <FaCheck />, color: "#27ae60" };
        if (booking.isConfirmed && !booking.isPayd) {
            return paymentTimeLeft[booking.roomBookingId] === "время истекло"
                ? { text: "Отменено (не оплачено)", icon: <FaTimes />, color: "#e74c3c" }
                : { text: "Ожидает оплаты", icon: <FaClock />, color: "#e67e22" };
        }
        if (!booking.isConfirmed && !booking.isPayd) {
            return confirmationTimeLeft[booking.roomBookingId] === "время истекло"
                ? { text: "Истекло время", icon: <FaTimes />, color: "#e74c3c" }
                : { text: "Ожидает подтверждения", icon: <FaClock />, color: "#3498db" };
        }
        return { text: "Неизвестный статус", icon: null, color: "#7f8c8d" };
    };

    const getTotalPrice = (booking) => {
        const checkIn = new Date(`${booking.checkInDate}T${booking.checkInTime}`);
        const checkOut = new Date(`${booking.checkOutDate}T${booking.checkOutTime}`);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return nights * booking.unitPrice;
    };

    const handleDelete = async (bookingId) => {
        try {
            await axios.delete(`http://localhost:5221/api/room-bookings/${bookingId}`);
            setRoomBookings(roomBookings.filter(b => b.roomBookingId !== bookingId));
        } catch (error) {
            console.error(`Ошибка при удалении: ${error.message}`);
            alert("Не удалось удалить бронирование");
        }
    };

    const handleConfirm = async (bookingId) => {
        try {
            const response = await axios.patch(`http://localhost:5221/api/room-bookings/${bookingId}/confirm`);
            setRoomBookings(prev =>
                prev.map(b => b.roomBookingId === bookingId ? { ...b, ...response.data } : b)
            );
        } catch (error) {
            console.error(`Ошибка при подтверждении бронирования: ${error.message}`);
            alert("Не удалось подтвердить бронирование");
        }
    };

    const checkReviewAvailability = async (bookingId) => {
        try {
            const response = await axios.get(`http://localhost:5221/api/hotel-reviews/${bookingId}/availability`);
            return response.data;
        } catch (error) {
            console.error("Ошибка при проверке отзыва: ", error.message);
            return false;
        }
    }

    const canCancelBooking = (booking) => {
        if (!booking.checkInDate || !booking.checkInTime) return false;

        const checkInDateTime = new Date(`${booking.checkInDate}T${booking.checkInTime}`);
        const currentDateTime = new Date();
        const timeLeft = checkInDateTime - currentDateTime;

        return timeLeft > 86400000;
    }

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка бронирований...</p>
            </div>
        </div>
    );

    if (error && roomBookings === null) return (
        <div className="container">
            <Navbar />
            <div className="error-message">
                <p style={{ color: "red" }}>Ошибка: {error}</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Мои бронирования</h1>

            {roomBookings.length === 0 ? (
                <div className="no-bookings">
                    <FaHotel size={50} />
                    <p>У вас нет активных бронирований</p>
                    <Link to="/hotels/1/rooms" className="btn btn-primary">
                        Забронировать комнату
                    </Link>
                </div>
            ) : (
                roomBookings.map((booking) => {
                    const status = getStatus(booking);
                    const totalPrice = getTotalPrice(booking);
                    const nights = Math.ceil(
                        (new Date(`${booking.checkOutDate}T${booking.checkOutTime}`) -
                            new Date(`${booking.checkInDate}T${booking.checkInTime}`)) / (1000 * 60 * 60 * 24)
                    );

                    return (
                        <div key={booking.roomBookingId} className="booking-card">
                            <div className="booking-header">
                                <div className="hotel-info">
                                    <h2>Номер {booking.roomNumber}</h2>
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
                                            Даты проживания: {booking.checkInDate} - {booking.checkOutDate} ({nights} ночей)
                                        </p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <p className="detail-value">Гостей: {booking.numberOfGuests} взрослых</p>
                                    </div>
                                </div>


                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="detail-value">
                                            Цена: {totalPrice} ₽ ({booking.unitPrice} ₽ за ночь)
                                        </p>
                                    </div>
                                </div>

                                {!booking.isConfirmed && !booking.isPayd && (
                                    <div className="timer">
                                        <div className="icon-wrapper">
                                            <FaClock />
                                        </div>
                                        <div>
                                            <p className="detail-value" style={{
                                                color: confirmationTimeLeft[booking.roomBookingId] === "время истекло" ? "#e74c3c" : "#3498db",
                                                fontWeight: "bold"
                                            }}>
                                                До автоматической отмены: {confirmationTimeLeft[booking.roomBookingId] || "—"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {booking.isConfirmed && !booking.isPayd && (
                                    <div className="timer">
                                        <div className="icon-wrapper">
                                            <FaClock />
                                        </div>
                                        <div>
                                            <p className="detail-value" style={{
                                                color: paymentTimeLeft[booking.roomBookingId] === "время истекло" ? "#e74c3c" : "#e67e22",
                                                fontWeight: "bold"
                                            }}>
                                                До автоматической отмены (оплата): {paymentTimeLeft[booking.roomBookingId] || "—"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {booking.amenities && booking.amenities.length > 0 && (
                                    <div className="amenities">
                                        <p className="amenities-title">Удобства номера:</p>
                                        <div className="amenities-list">
                                            {booking.amenities.map(amenity => (
                                                <span key={amenity.id} className="amenity">
                                                    {amenity.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="booking-actions">
                                {!booking.isConfirmed && (
                                    <button
                                        onClick={() => handleConfirm(booking.roomBookingId)}
                                        className="btn btn-primary"
                                        disabled={confirmationTimeLeft[booking.roomBookingId] === "время истекло"}
                                    >
                                        Подтвердить
                                    </button>
                                )}

                                {!booking.isPayd && booking.isConfirmed && paymentTimeLeft[booking.roomBookingId] !== "время истекло" && (
                                    <Link
                                        to={`/payment-room-booking/${booking.roomBookingId}`}
                                        className="btn btn-primary"
                                    >
                                        Оплатить
                                    </Link>
                                )}

                                {booking.isPayd && booking.isConfirmed && reviewsAvailability[booking.roomBookingId] && (
                                    <Link
                                        to={`/hotel-review/${booking.roomBookingId}`}
                                        className="btn btn-secondary"
                                    >
                                        Оставить отзыв
                                    </Link>
                                )}

                                {canCancelBooking(booking) && (
                                    <button
                                        onClick={() => handleDelete(booking.roomBookingId)}
                                        className="btn btn-danger"
                                    >
                                        Отменить
                                    </button>
                                )}

                                {booking.isPayd && booking.isConfirmed && (
                                    <Link
                                        to={`/amenity-list/${booking.roomBookingId}`}
                                        className="btn btn-primary"
                                    >
                                        Просмотреть услуги
                                    </Link>
                                )}

                                {booking.isPayd && booking.isConfirmed && (
                                    <Link
                                        to={`/myamenitys/${booking.roomBookingId}`}
                                        className="btn btn-primary"
                                    >
                                        Посмотреть заказанные услуги
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

                .timer {
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    margin-top: 10px;
                }

                .amenities {
                    margin-top: 15px;
                }

                .amenities-title {
                    font-weight: 500;
                    color: #7f8c8d;
                    font-size: 0.9rem;
                    margin-bottom: 10px;
                }

                .amenities-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .amenity {
                    background-color: #f0f7ff;
                    color: #3498db;
                    padding: 5px 12px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
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

                .btn-primary:hover:not(:disabled) {
                    background-color: #2980b9;
                }

                .btn-primary:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }

                .btn-danger {
                    background-color: #e74c3c;
                    color: white;
                }

                .btn-danger:hover:not(:disabled) {
                    background-color: #c0392b;
                }

                .btn-danger:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
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

export default RoomBookingsList;