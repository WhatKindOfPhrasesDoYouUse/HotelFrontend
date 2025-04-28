import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import {FaSpinner} from "react-icons/fa";

const AmenityBookingsList = () => {
    const {bookingId} = useParams();
    const [amenityBookings, setAmenityBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const styles = {
        container: {
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            maxWidth: "1200px",
            margin: "0 auto"
        },
        title: {
            color: "#333",
            marginBottom: "20px",
            textAlign: "center"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
            boxShadow: "0 2px 3px rgba(0,0,0,0.1)",
            marginBottom: "20px"
        },
        tableHeader: {
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            padding: "12px",
            textAlign: "left",
            fontWeight: "bold",
            color: "#333"
        },
        tableCell: {
            border: "1px solid #ddd",
            padding: "10px",
            textAlign: "left"
        },
        loading: {
            textAlign: "center",
            padding: "20px",
            color: "#666"
        },
        error: {
            color: "#d32f2f",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#fdecea",
            borderRadius: "4px",
            margin: "20px 0"
        }
    };

    useEffect(() => {
        if (!bookingId) return;

        axios.get(`http://localhost:5221/api/amenity-bookings/${bookingId}/details/room-booking`)
            .then(response => {
                setAmenityBookings(response.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(`Ошибка получения забронированных дополнительных услуг: ${err.message}`);
                setError(err);
                setLoading(false);
            })
    }, [bookingId]);

    if (loading) return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.loading}>
                <FaSpinner className="spinner" />
                <p>Загрузка дополнительных услуг...</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={styles.container}>
            <Navbar />
            <div style={styles.error}>
                <p>Ошибка: {error.message}</p>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <Navbar />
            <h2 style={styles.title}>Забронированные услуги для бронирования #{bookingId}</h2>
            {amenityBookings.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.tableHeader}>ID</th>
                        <th style={styles.tableHeader}>Дата заказа</th>
                        <th style={styles.tableHeader}>Время заказа</th>
                        <th style={styles.tableHeader}>Статус выполнения</th>
                        <th style={styles.tableHeader}>Количество</th>
                        <th style={styles.tableHeader}>Сотрудник</th>
                        <th style={styles.tableHeader}>Стоимость</th>
                        <th style={styles.tableHeader}>Статус оплаты</th>
                        <th style={styles.tableHeader}>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {amenityBookings.map((booking) => (
                        <tr key={booking.id}>
                            <td style={styles.tableCell}>{booking.id}</td>
                            <td style={styles.tableCell}>{new Date(booking.orderDate).toLocaleDateString()}</td>
                            <td style={styles.tableCell}>{booking.orderTime}</td>
                            <td style={styles.tableCell}>{booking.completionStatus}</td>
                            <td style={styles.tableCell}>{booking.quantity}</td>
                            <th style={styles.tableCell}>{booking.employeeName}</th>
                            <th style={styles.tableCell}>{booking.totalAmount}</th>
                            <th style={styles.tableCell}>{booking.isPayd ? "Оплачено" : "Не оплачено"}</th>
                            <td style={styles.tableCell}>
                                {!booking.isPayd && (
                                    <Link
                                        to={`/amenity-payment/${booking.id}`}
                                        style={{
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            backgroundColor: '#4a6bff',
                                            color: 'white',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#3a5bef'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#4a6bff'}
                                    >
                                        Оплатить
                                    </Link>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Нет забронированных дополнительных услуг</p>
            )}
        </div>
    );
}

export default AmenityBookingsList;