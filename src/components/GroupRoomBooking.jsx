import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaCalendarAlt, FaUserAlt, FaBed, FaMoneyBillWave, FaExclamationTriangle, FaIdCard, FaBirthdayCake } from "react-icons/fa";

const GroupRoomBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [roomDetails, setRoomDetails] = useState(null);
    const [mainGuest, setMainGuest] = useState({
        checkInDate: "",
        checkOutDate: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        guestId: "",
        roomId: roomId,
    });

    const [additionalGuests, setAdditionalGuests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchGuestAndRoomInfo = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Пользователь не авторизован");
                    setLoading(false);
                    return;
                }

                const decoded = jwtDecode(token);
                const guestRes = await axios.get(`http://localhost:5221/api/guests/${decoded.client_id}`);
                setMainGuest(prev => ({ ...prev, guestId: guestRes.data.id }));

                const roomRes = await axios.get(`http://localhost:5221/api/rooms/${roomId}`);
                setRoomDetails(roomRes.data);

                const additionalGuestsCount = roomRes.data.capacity - 1;
                setAdditionalGuests(
                    Array(additionalGuestsCount).fill().map(() => ({
                        name: "",
                        surname: "",
                        patronymic: "",
                        passportSeries: "",
                        passportNumber: "",
                        dateOfBirth: ""
                    }))
                );
            } catch (err) {
                console.error("Ошибка при получении данных:", err);
                setError("Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        };

        fetchGuestAndRoomInfo();
    }, [roomId]);

    const validateDates = () => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!mainGuest.checkInDate) {
            errors.checkInDate = "Укажите дату заезда";
        } else {
            const checkInDate = new Date(mainGuest.checkInDate);
            if (checkInDate < today) {
                errors.checkInDate = "Дата заезда не может быть в прошлом";
            }
        }

        if (!mainGuest.checkOutDate) {
            errors.checkOutDate = "Укажите дату выезда";
        } else if (mainGuest.checkInDate) {
            const checkInDate = new Date(mainGuest.checkInDate);
            const checkOutDate = new Date(mainGuest.checkOutDate);

            if (checkOutDate < checkInDate) {
                errors.checkOutDate = "Дата выезда не может быть раньше даты заезда";
            } else if (checkOutDate.getTime() === checkInDate.getTime()) {
                const checkInTime = mainGuest.checkInTime.split(':').map(Number);
                const checkOutTime = mainGuest.checkOutTime.split(':').map(Number);

                if (checkOutTime[0] < checkInTime[0] ||
                    (checkOutTime[0] === checkInTime[0] && checkOutTime[1] <= checkInTime[1])) {
                    errors.checkOutTime = "Время выезда должно быть позже времени заезда";
                }
            }
        }

        if (mainGuest.checkInDate === new Date().toISOString().split('T')[0]) {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();

            const [selectedHours, selectedMinutes] = mainGuest.checkInTime.split(':').map(Number);

            if (selectedHours < currentHours ||
                (selectedHours === currentHours && selectedMinutes < currentMinutes)) {
                errors.checkInTime = "Время заезда не может быть в прошлом";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleMainGuestChange = (e) => {
        const { name, value } = e.target;
        setMainGuest(prev => ({
            ...prev,
            [name]: value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleAdditionalGuestChange = (index, e) => {
        const { name, value } = e.target;
        setAdditionalGuests(prev => {
            const updatedGuests = [...prev];
            updatedGuests[index] = {
                ...updatedGuests[index],
                [name]: value
            };
            return updatedGuests;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateDates()) {
            return;
        }

        setLoading(true);
        setError(null);

        const payload = {
            guestId: parseInt(mainGuest.guestId, 10),
            roomId: parseInt(mainGuest.roomId, 10),
            numberOfGuests: roomDetails.capacity,
            checkInDate: mainGuest.checkInDate,
            checkOutDate: mainGuest.checkOutDate,
            checkInTime: mainGuest.checkInTime + ":00",
            checkOutTime: mainGuest.checkOutTime + ":00",
            additionalGuests: additionalGuests.map(guest => ({
                name: guest.name,
                surname: guest.surname,
                patronymic: guest.patronymic,
                passportSeriesHash: guest.passportSeries,
                passportNumberHash: guest.passportNumber,
                dateOfBirth: guest.dateOfBirth,
                guestId: null
            }))
        };

        try {
            const response = await axios.post(
                "http://localhost:5221/api/room-bookings/group-booking",
                payload
            );
            navigate("/mybookings");
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
            <h1>Групповое бронирование комнаты #{roomId}</h1>

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
                            value={mainGuest.checkInDate}
                            onChange={handleMainGuestChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {validationErrors.checkInDate && (
                            <div className="validation-error">{validationErrors.checkInDate}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Время заезда
                        </label>
                        <input
                            type="time"
                            name="checkInTime"
                            value={mainGuest.checkInTime}
                            onChange={handleMainGuestChange}
                            required
                        />
                        {validationErrors.checkInTime && (
                            <div className="validation-error">{validationErrors.checkInTime}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Дата выезда
                        </label>
                        <input
                            type="date"
                            name="checkOutDate"
                            value={mainGuest.checkOutDate}
                            onChange={handleMainGuestChange}
                            required
                            min={mainGuest.checkInDate || new Date().toISOString().split('T')[0]}
                        />
                        {validationErrors.checkOutDate && (
                            <div className="validation-error">{validationErrors.checkOutDate}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCalendarAlt /> Время выезда
                        </label>
                        <input
                            type="time"
                            name="checkOutTime"
                            value={mainGuest.checkOutTime}
                            onChange={handleMainGuestChange}
                            required
                        />
                        {validationErrors.checkOutTime && (
                            <div className="validation-error">{validationErrors.checkOutTime}</div>
                        )}
                    </div>

                    <h3 className="section-title">Дополнительные гости ({roomDetails?.capacity - 1} человек)</h3>

                    {additionalGuests.map((guest, index) => (
                        <div key={index} className="guest-card">
                            <h4 className="guest-title">Гость #{index + 1}</h4>

                            <div className="form-group">
                                <label>
                                    <FaUserAlt /> Имя
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={guest.name}
                                    onChange={(e) => handleAdditionalGuestChange(index, e)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaUserAlt /> Фамилия
                                </label>
                                <input
                                    type="text"
                                    name="surname"
                                    value={guest.surname}
                                    onChange={(e) => handleAdditionalGuestChange(index, e)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaUserAlt /> Отчество
                                </label>
                                <input
                                    type="text"
                                    name="patronymic"
                                    value={guest.patronymic}
                                    onChange={(e) => handleAdditionalGuestChange(index, e)}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaIdCard /> Серия паспорта
                                </label>
                                <input
                                    type="text"
                                    name="passportSeries"
                                    value={guest.passportSeries}
                                    onChange={(e) => handleAdditionalGuestChange(index, e)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaIdCard /> Номер паспорта
                                </label>
                                <input
                                    type="text"
                                    name="passportNumber"
                                    value={guest.passportNumber}
                                    onChange={(e) => handleAdditionalGuestChange(index, e)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaBirthdayCake /> Дата рождения
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={guest.dateOfBirth}
                                    onChange={(e) => handleAdditionalGuestChange(index, e)}
                                    required
                                />
                            </div>
                        </div>
                    ))}

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

                .section-title {
                    color: #2c3e50;
                    margin: 25px 0 15px;
                    font-size: 1.2rem;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
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
                    width: 90%;
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

                .validation-error {
                    background-color: #fdecea;
                    padding: 8px 12px;
                    border-radius: 6px;
                    color: #e74c3c;
                    margin-top: 5px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .guest-card {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 3px solid #3498db;
                }

                .guest-title {
                    color: #2c3e50;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-size: 1.1rem;
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

export default GroupRoomBooking;