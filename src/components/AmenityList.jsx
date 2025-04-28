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
        evenRow: {
            backgroundColor: "#f9f9f9"
        },
        oddRow: {
            backgroundColor: "#fff"
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
        <div style={styles.container}>
            <Navbar />
            <h2 style={styles.title}>Дополнительные услуги для бронирования #{bookingId}</h2>
            {amenities.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.tableHeader}>ID</th>
                        <th style={styles.tableHeader}>Название</th>
                        <th style={styles.tableHeader}>Описание</th>
                        <th style={styles.tableHeader}>Цена за единицу</th>
                        <th style={styles.tableHeader}>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {amenities.map(amenity => (
                        <tr key={amenity.id}>
                            <td style={styles.tableCell}>{amenity.id}</td>
                            <td style={styles.tableCell}>{amenity.name}</td>
                            <td style={styles.tableCell}>{amenity.description || 'Описание отсутствует'}</td>
                            <td style={styles.tableCell}>{amenity.unitPrice}</td>
                            <td style={styles.tableCell}>
                                <Link to={`/amenity-booking/${amenity.id}/${bookingId}`}>
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
    );
}

export default AmenityList;