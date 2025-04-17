import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";

const RoomBookingsList = () => {
    const [roomBookings, setRoomBookings] = useState([]);
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            })
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


    console.log(`id гостя: ${guestId}`);
    console.log(roomBookings);

    if (loading) return <p>Загрузка...</p>
    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

    const getDeadlineStatus = (cancelUntilDate, cancelUntilTime) => {
        const currentDate = new Date();
        const cancelDate = new Date(`${cancelUntilDate}T${cancelUntilTime}`);

        if (currentDate < cancelDate) {
            return "green";
        } else {
            return "red";
        }
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
                    <th style={thStyle}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {roomBookings.map((booking) => (
                    <tr key={booking.id} style={{borderBottom: "1px solid #eaeaea"}}>
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
                            {getDeadlineStatus(booking.cancelUntilDate, booking.cancelUntilTime) === 'green' && (
                                <button
                                    onClick={() => handleDelete(booking.roomBookingId)}
                                    style={{
                                        marginLeft: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Удалить
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
