import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "../Navbar.jsx";
import {useParams} from "react-router-dom";

const DoneTaskList = () => {
    const {employeeId} = useParams();
    const [employeeType, setEmployeeType] = useState(null);
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
        const fetchEmployeeType = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Пользователь не авторизован");
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const response = await axios.get(
                    `http://localhost:5221/api/clients/${decodedToken.client_id}/employee-type`
                );
                setEmployeeType(response.data);
            } catch (err) {
                setError("Ошибка загрузки типа сотрудника");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeType();
    }, []);

    useEffect(() => {
        const fetchAmenities = async () => {
            if (!employeeType?.id) return;

            setLoading(true);
            const token = localStorage.getItem("token");

            try {
                const response = await axios.get(
                    `http://localhost:5221/api/amenity-bookings/in-progress/employee/${employeeId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                setAmenities(response.data);
            } catch (err) {
                setError("Ошибка загрузки списка оказанных услуг");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAmenities();
    }, [employeeType?.id]);

    const handleDoneTask = async (amenityBookingId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Пользователь не авторизован");
            return;
        }

        try {
            await axios.patch(`http://localhost:5221/api/amenity-bookings/${amenityBookingId}/${employeeId}/done-amenity-task`);

            const response = await axios.get(
                `http://localhost:5221/api/amenity-bookings/in-progress/employee/${employeeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            setAmenities(response.data);
        } catch (err) {
            setError("Ошибка при вязтии комнаты");
            console.error(err);
        }
    }

    if (loading) {
        return <div style={styles.loading}>Загрузка данных...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    if (!employeeType) {
        return <div style={styles.error}>Данные о сотруднике не загружены</div>;
    }

    return (
        <div style={styles.container}>
            <Navbar />

            <h2 style={styles.title}>Оказанные услуги</h2>

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.tableHeader}>ID</th>
                    <th style={styles.tableHeader}>Дата заказа</th>
                    <th style={styles.tableHeader}>Время заказа</th>
                    <th style={styles.tableHeader}>Статус</th>
                    <th style={styles.tableHeader}>Количество</th>
                    <th style={styles.tableHeader}>Название услуги</th>
                    <th style={styles.tableHeader}>Цена</th>
                    <th style={styles.tableHeader}>Статус оплаты</th>
                    <th style={styles.tableHeader}>Имя гостя</th>
                    <th style={styles.tableHeader}>Номер комнаты</th>
                    <th style={styles.tableHeader}>Действия</th>
                </tr>
                </thead>
                <tbody>
                {amenities.map((amenity, index) => (
                    <tr key={amenity.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={styles.tableCell}>{amenity.id}</td>
                        <td style={styles.tableCell}>{amenity.orderDate}</td>
                        <td style={styles.tableCell}>{amenity.orderTime}</td>
                        <td style={styles.tableCell}>{amenity.completionStatus}</td>
                        <td style={styles.tableCell}>{amenity.quantity}</td>
                        <td style={styles.tableCell}>{amenity.amenityName}</td>
                        <td style={styles.tableCell}>{amenity.totalAmount}</td>
                        <th style={styles.tableCell}>{amenity.isPayd ? "Оплачено" : "Не оплачено"}</th>
                        <td style={styles.tableCell}>{amenity.guestName}</td>
                        <td style={styles.tableCell}>{amenity.roomNumber}</td>
                        <th style={styles.tableCell}>
                            <button
                                onClick={() => handleDoneTask(amenity.id)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Завершить
                            </button>
                        </th>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DoneTaskList;