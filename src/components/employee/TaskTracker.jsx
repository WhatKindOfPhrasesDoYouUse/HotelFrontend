import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "../Navbar.jsx";
import { useParams } from "react-router-dom";
import { FaSpinner, FaExclamationTriangle, FaCheck } from "react-icons/fa";

const TaskTracker = () => {
    const { employeeId } = useParams();
    const [employeeType, setEmployeeType] = useState(null);
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
                    `http://localhost:5221/api/amenity-bookings/${employeeType.id}/tasks-by-employee-type`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
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

    const handleTakeTask = async (amenityBookingId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Пользователь не авторизован");
            return;
        }

        try {
            await axios.patch(
                `http://localhost:5221/api/amenity-bookings/${amenityBookingId}/${employeeId}/take-amenity-task`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const response = await axios.get(
                `http://localhost:5221/api/amenity-bookings/${employeeType.id}/tasks-by-employee-type`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAmenities(response.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError("Ошибка при взятии задачи");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <Navbar />
                <div className="loading-spinner">
                    <FaSpinner className="spinner" />
                    <p>Загрузка данных...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <Navbar />
                <div className="error-message">
                    <FaExclamationTriangle /> {error}
                </div>
            </div>
        );
    }

    if (!employeeType) {
        return (
            <div className="container">
                <Navbar />
                <div className="error-message">
                    <FaExclamationTriangle /> Данные о сотруднике не загружены
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />

            <div className="header">
                <h1>Оказанные услуги</h1>
            </div>

            {success && (
                <div className="success-message">
                    <FaCheck /> Задача успешно взята!
                </div>
            )}

            {amenities.length > 0 ? (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Дата заказа</th>
                                <th>Время заказа</th>
                                <th>Статус задачи</th>
                                <th>Количество единиц</th>
                                <th>Имя гостя</th>
                                <th>Комната</th>
                                <th>Оплата</th>
                                <th>Сумма услуги</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {amenities.map((amenity, index) => (
                                <tr key={amenity.id}>
                                    <td>{amenity.id}</td>
                                    <td>{amenity.orderDate}</td>
                                    <td>{amenity.orderTime.substring(0, 5)}</td>
                                    <td>{amenity.completionStatus}</td>
                                    <td>{amenity.quantity}</td>
                                    <td>{amenity.guestName}</td>
                                    <td>{amenity.roomNumber}</td>
                                    <td>{amenity.isPayd ? "Оплачено" : "Не оплачено"}</td>
                                    <td>{amenity.totalAmount}</td>
                                    <td className="actions-cell">
                                        <div className="actions">
                                            <button
                                                className="btn btn-take"
                                                onClick={() => handleTakeTask(amenity.id)}
                                            >
                                                <FaCheck /> Взять
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="no-data">Нет данных об услугах</div>
            )}

            <style jsx>{`
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                .header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                h1 {
                    color: #2c3e50;
                    margin: 0;
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
                    color: #3498db;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                .error-message {
                    background-color: #fdecea;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: center;
                    color: #e74c3c;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                }

                .success-message {
                    background-color: #e8f5e9;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 25px;
                    text-align: center;
                    color: #2e7d32;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                }

                .card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    border-left: 4px solid #2980b9;
                }

                .table-container {
                    overflow-x: auto;
                    margin-bottom: 30px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    font-size: 14px;
                }

                th,
                td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                    vertical-align: middle;
                }

                th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #2c3e50;
                    position: sticky;
                    top: 0;
                }

                tr:hover {
                    background-color: #f5f5f5;
                }

                .actions-cell {
                    text-align: center;
                }

                .actions {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                }

                .btn {
                    padding: 8px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-take {
                    background-color: #4caf50;
                    color: white;
                }

                .btn-take:hover {
                    background-color: #45a049;
                }

                .no-data {
                    text-align: center;
                    padding: 20px;
                    color: #7f8c8d;
                    background-color: #f8f9fa;
                    border-radius: 6px;
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 15px;
                    }

                    h1 {
                        font-size: 24px;
                    }

                    th,
                    td {
                        padding: 8px 10px;
                        font-size: 13px;
                    }

                    .btn {
                        padding: 6px 8px;
                    }

                    .actions {
                        flex-direction: column;
                        gap: 5px;
                    }
                }
            `}</style>
        </div>
    );
};

export default TaskTracker;