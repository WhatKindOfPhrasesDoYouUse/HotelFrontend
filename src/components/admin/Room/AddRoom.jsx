import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner, FaHotel, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import Navbar from "../../Navbar.jsx";

const AddRoom = () => {
    const [roomData, setRoomData] = useState({
        roomNumber: '',
        description: '',
        capacity: '',
        unitPrice: '',
        hotelId: 1
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!roomData.roomNumber || isNaN(roomData.roomNumber) || parseInt(roomData.roomNumber) <= 0 || !Number.isInteger(Number(roomData.roomNumber))) {
            errors.roomNumber = "Номер комнаты должен быть положительным целым числом";
            isValid = false;
        }

        if (!roomData.description.trim()) {
            errors.description = "Описание комнаты обязательно";
            isValid = false;
        }

        if (!roomData.capacity || isNaN(roomData.capacity) || parseInt(roomData.capacity) <= 0 || !Number.isInteger(Number(roomData.capacity))) {
            errors.capacity = "Вместимость должна быть положительным целым числом";
            isValid = false;
        }

        if (!roomData.unitPrice || isNaN(roomData.unitPrice) || parseFloat(roomData.unitPrice) <= 0) {
            errors.unitPrice = "Цена должна быть положительным числом";
            isValid = false;
        }

        if (!roomData.hotelId || isNaN(roomData.hotelId) || parseInt(roomData.hotelId) <= 0 || !Number.isInteger(Number(roomData.hotelId))) {
            errors.hotelId = "ID отеля должен быть положительным целым числом";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomData(prev => ({
            ...prev,
            [name]: name === 'roomNumber' || name === 'capacity' || name === 'hotelId'
                ? (value === '' ? '' : parseInt(value))
                : name === 'unitPrice'
                    ? (value === '' ? '' : parseFloat(value))
                    : value
        }));
        if (submitAttempted && Object.keys(validationErrors).length > 0) {
            setValidationErrors({});
            setSubmitAttempted(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                roomNumber: parseInt(roomData.roomNumber),
                description: roomData.description.trim(),
                capacity: parseInt(roomData.capacity),
                unitPrice: parseFloat(roomData.unitPrice),
                hotelId: parseInt(roomData.hotelId)
            };

            await axios.post("http://localhost:5221/api/rooms", payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });

            setSuccess(true);
            setTimeout(() => navigate("/room-administration"), 1500);
        } catch (err) {
            console.error("Ошибка при добавлении комнаты:", err);

            if (err.response?.status === 409) {
                setError("Комната с таким номером уже существует");
            } else {
                setError(err.response?.data?.message || "Не удалось добавить комнату");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Добавление комнаты...</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Добавление новой комнаты</h1>

            <div className="card-form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> Комната успешно добавлена!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FaHotel /> Номер комнаты
                        </label>
                        <input
                            type="number"
                            name="roomNumber"
                            value={roomData.roomNumber}
                            onChange={handleChange}
                            placeholder="Введите номер комнаты"
                            className={submitAttempted && validationErrors.roomNumber ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.roomNumber && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.roomNumber}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> Описание
                        </label>
                        <textarea
                            name="description"
                            value={roomData.description}
                            onChange={handleChange}
                            placeholder="Введите описание комнаты"
                            className={submitAttempted && validationErrors.description ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.description && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.description}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> Вместимость
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={roomData.capacity}
                            onChange={handleChange}
                            placeholder="Введите вместимость"
                            className={submitAttempted && validationErrors.capacity ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.capacity && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.capacity}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> Цена за ночь
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="unitPrice"
                            value={roomData.unitPrice}
                            onChange={handleChange}
                            placeholder="Введите цену"
                            className={submitAttempted && validationErrors.unitPrice ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.unitPrice && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.unitPrice}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> ID отеля
                        </label>
                        <input
                            type="number"
                            name="hotelId"
                            value={roomData.hotelId}
                            onChange={handleChange}
                            placeholder="Введите ID отеля"
                            className={submitAttempted && validationErrors.hotelId ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.hotelId && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.hotelId}
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="spinner" /> : "Добавить комнату"}
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

                .card-form-card {
                    background: white;
                    border-radius: 10px;
                    width: 600px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin: 0 auto;
                    border-left: 4px solid #2980b9;
                    border-top: 1px solid #e0e0e0;
                    border-right: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
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

                .form-group input,
                .form-group textarea,
                .select-wrapper {
                    width: 100%;
                    box-sizing: border-box;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: black;
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .form-group input.input-error,
                .form-group textarea.input-error,
                .form-group select.input-error {
                    border-color: #e74c3c;
                    background-color: #fff9f9;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
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
                    .card-form-card {
                        width: 100%;
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

export default AddRoom;