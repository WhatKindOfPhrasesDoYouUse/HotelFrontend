import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaCalendarAlt, FaUserAlt, FaBed, FaMoneyBillWave, FaExclamationTriangle } from "react-icons/fa";

const SingleRoomBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        checkInDate: "",
        checkOutDate: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        guestId: "",
        numberOfGuests: 1,
        roomId: roomId,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [roomDetails, setRoomDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Получаем данные о комнате
                const roomRes = await axios.get(`http://localhost:5221/api/rooms/${roomId}`);
                setRoomDetails(roomRes.data);

                // Получаем ID гостя
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Пользователь не авторизован");
                    setLoading(false);
                    return;
                }

                const decoded = jwtDecode(token);
                const guestRes = await axios.get(`http://localhost:5221/api/guests/${decoded.client_id}`);
                setForm(prev => ({ ...prev, guestId: guestRes.data.id }));
            } catch (err) {
                console.error("Ошибка при получении данных:", err);
                setError("Не удалось загрузить необходимые данные");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...form,
            checkInTime: form.checkInTime + ":00",
            checkOutTime: form.checkOutTime + ":00",
            roomId: parseInt(form.roomId, 10),
        };

        try {
            const response = await axios.post("http://localhost:5221/api/room-bookings/single-booking", payload);
            navigate(`/booking-confirmation/${response.data.id}`);
        } catch (err) {
            console.error("Ошибка при создании бронирования:", err);
            setError(err.response?.data?.message || "Не удалось создать бронирование");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка данных...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="error-message">
                <FaExclamationTriangle /> {error}
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Бронирование комнаты #{roomId}</h1>

            {/*{roomDetails && (
                <div className="room-info-card">
                    <div className="room-header">
                        <h2>{roomDetails.roomTypeName}</h2>
                        <div className="room-price">
                            {roomDetails.pricePerNight} ₽ / ночь
                        </div>
                    </div>

                    <div className="room-details">
                        <div className="detail-item">
                            <div className="icon-wrapper">
                                <FaBed />
                            </div>
                            <div>
                                <p className="detail-label">Вместимость</p>
                                <p className="detail-value">До {roomDetails.capacity} гостей</p>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="icon-wrapper">
                                <FaMoneyBillWave />
                            </div>
                            <div>
                                <p className="detail-label">Цена за ночь</p>
                                <p className="detail-value">{roomDetails.pricePerNight} ₽</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}*/}

            <div className="booking-form-card">
                <p className="info-note">
                    После оформления у вас будет <strong>15 минут</strong> на подтверждение бронирования.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Дата заезда
                        </label>
                        <input
                            type="date"
                            name="checkInDate"
                            value={form.checkInDate}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Время заезда
                        </label>
                        <input
                            type="time"
                            name="checkInTime"
                            value={form.checkInTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Дата выезда
                        </label>
                        <input
                            type="date"
                            name="checkOutDate"
                            value={form.checkOutDate}
                            onChange={handleChange}
                            required
                            min={form.checkInDate || new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Время выезда
                        </label>
                        <input
                            type="time"
                            name="checkOutTime"
                            value={form.checkOutTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FaUserAlt /> Количество гостей
                        </label>
                        <input
                            type="number"
                            name="numberOfGuests"
                            value={form.numberOfGuests}
                            onChange={handleChange}
                            min="1"
                            max={roomDetails?.capacity || 4}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : "Забронировать"}
                        </button>
                    </div>

                    {error && (
                        <div className="form-error">
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}
                </form>
            </div>

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

                .room-info-card,
                .booking-form-card {
                    background: white;
                    border-radius: 10px;
                    width: 600px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin-bottom: 25px;
                    border-left: 4px solid #2980b9;
                    border-top: 1px solid #e0e0e0;
                    border-right: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
                }

                .room-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .room-header h2 {
                    font-size: 1.4rem;
                    color: #2c3e50;
                    margin: 0;
                }

                .room-price {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #27ae60;
                }

                .room-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
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

                .detail-label {
                    font-size: 0.9rem;
                    color: #7f8c8d;
                    margin: 0 0 2px 0;
                }

                .detail-value {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #2d3436;
                    margin: 0;
                }

                .info-note {
                    background-color: #e3f2fd;
                    padding: 12px;
                    border-radius: 6px;
                    color: #1976d2;
                    margin-top: 0;
                    margin-bottom: 25px;
                    text-align: center;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .form-group input {
                    width: 500px;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: black;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 30px;
                }

                .btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 1rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2980b9;
                }

                .btn-primary:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }

                .form-error {
                    background-color: #fdecea;
                    padding: 12px;
                    border-radius: 6px;
                    color: #e74c3c;
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                @media (max-width: 600px) {
                    .room-details {
                        grid-template-columns: 1fr;
                    }

                    .form-actions {
                        justify-content: center;
                    }

                    .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default SingleRoomBooking;