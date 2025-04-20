import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";
import {Link} from "react-router-dom";

const RoomBookingsList = () => {
    const [roomBookings, setRoomBookings] = useState([]);
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState({});

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
            .then((response) => {
                setRoomBookings(response.data);
            })
            .catch((err) => {
                setError(`Ошибка при загрузке данных забронированных комнат: ${err.message}`);
                setRoomBookings(null);
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
                    setError(`Ошибка при обновлении списка: ${err.message}`);
                });
        }, 15000);

        return () => clearInterval(interval);
    }, [guestId]);

    useEffect(() => {
        const interval = setInterval(() => {
            const updatedTimers = {};

            roomBookings.forEach((booking) => {
                if (!booking.isPayd && !booking.isConfirmed && booking.createdAt) {
                    const createdAt = new Date(booking.createdAt);
                    const deadline = new Date(createdAt.getTime() + 15 * 60 * 1000);
                    const now = new Date();
                    const diff = deadline - now;

                    if (diff > 0) {
                        const minutes = Math.floor(diff / 60000);
                        const seconds = Math.floor((diff % 60000) / 1000);
                        updatedTimers[booking.roomBookingId] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    } else {
                        updatedTimers[booking.roomBookingId] = "время истекло";
                    }
                }
            });

            setTimeLeft(updatedTimers);
        }, 1000);

        return () => clearInterval(interval);
    }, [roomBookings]);

    const getDeadlineStatus = (cancelUntilDate, cancelUntilTime) => {
        const currentDate = new Date();
        const cancelDate = new Date(`${cancelUntilDate}T${cancelUntilTime}`);
        return currentDate < cancelDate ? "green" : "red";
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

    if (loading) return <p>Загрузка...</p>
    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <Navbar />
            <h2 style={{ marginBottom: "20px" }}>Мои бронирования</h2>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                <thead style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
                <tr>
                    <th style={thStyle}>Номер комнаты</th>
                    <th style={thStyle}>Дата заезда</th>
                    <th style={thStyle}>Дата выезда</th>
                    <th style={thStyle}>Цена/ночь</th>
                    <th style={thStyle}>Количество гостей</th>
                    <th style={thStyle}>Дедлайн для отмены</th>
                    <th style={thStyle}>Статус оплаты</th>
                    <th style={thStyle}>Подтверждение</th>
                    <th style={thStyle}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {roomBookings.map((booking) => (
                    <tr key={booking.roomBookingId} style={{borderBottom: "1px solid #eaeaea"}}>
                        <td style={tdStyle}>{booking.roomNumber}</td>
                        <td style={tdStyle}>{booking.checkInDate} {booking.checkInTime}</td>
                        <td style={tdStyle}>{booking.checkOutDate} {booking.checkOutTime}</td>
                        <td style={tdStyle}>{booking.unitPrice}</td>
                        <td style={tdStyle}>{booking.numberOfGuests}/{booking.capacity}</td>
                        <td style={tdStyle}>
                                <span
                                    style={{color: getDeadlineStatus(booking.cancelUntilDate, booking.cancelUntilTime)}}>
                                    {booking.cancelUntilDate} {booking.cancelUntilTime}
                                </span>
                        </td>
                        <td style={{
                            ...tdStyle,
                            color: booking.isPayd ? "green" : "red",
                            fontWeight: "bold"
                        }}>
                            {booking.isPayd ? "Оплачено" : "Не оплачено"}
                        </td>
                        <td style={tdStyle}>
                            {booking.isConfirmed ? (
                                <span style={{color: "green", fontWeight: "bold"}}>Подтверждено</span>
                            ) : (
                                !booking.isPayd && (
                                    <span style={{
                                        color: timeLeft[booking.roomBookingId] === "время истекло"
                                            ? "red" : "orange"
                                    }}>
                                            ⏱️ {timeLeft[booking.roomBookingId] || "—"}
                                        </span>
                                )
                            )}
                        </td>
                        <td style={tdStyle}>
                            {!booking.isConfirmed && (
                                <button
                                    onClick={() => handleConfirm(booking.roomBookingId)}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        marginRight: '10px'
                                    }}
                                >
                                    Подтвердить
                                </button>
                            )}

                            {!booking.isPayd && booking.isConfirmed && (
                                <Link
                                    to={`/payment-room-booking/${booking.roomBookingId}`}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        textDecoration: 'none',
                                        display: 'inline-block'
                                    }}
                                >
                                    Оплатить
                                </Link>
                            )}

                            {getDeadlineStatus(booking.cancelUntilDate, booking.cancelUntilTime) === 'green' &&
                                !booking.isConfirmed && (
                                    <button
                                        onClick={() => handleDelete(booking.roomBookingId)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Отменить
                                    </button>
                                )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

const thStyle = {
    padding: "12px",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
    fontSize: "14px",
};

const tdStyle = {
    padding: "12px",
    fontSize: "14px",
    color: "#333",
};

export default RoomBookingsList;
