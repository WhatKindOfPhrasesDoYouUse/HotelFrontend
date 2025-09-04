import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner, FaHotel, FaExclamationTriangle, FaCheck, FaSave } from "react-icons/fa";
import Navbar from "../../Navbar.jsx";

const EditRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [editData, setEditData] = useState({
        roomNumber: '',
        description: '',
        capacity: '',
        unitPrice: '',
        hotelId: 1
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'roomNumber':
                if (!value) {
                    error = 'Номер комнаты обязателен';
                } else if (isNaN(value) || parseInt(value) <= 0 || !Number.isInteger(Number(value))) {
                    error = 'Номер комнаты должен быть положительным целым числом';
                }
                break;
            case 'description':
                if (!value.trim()) {
                    error = 'Описание обязательно';
                }
                break;
            case 'capacity':
                if (!value) {
                    error = 'Вместимость обязательна';
                } else if (isNaN(value) || parseInt(value) <= 0 || !Number.isInteger(Number(value))) {
                    error = 'Вместимость должна быть положительным целым числом';
                }
                break;
            case 'unitPrice':
                if (!value) {
                    error = 'Цена обязательна';
                } else if (isNaN(value) || parseFloat(value) <= 0) {
                    error = 'Цена должна быть положительным числом';
                }
                break;
            case 'hotelId':
                if (!value) {
                    error = 'ID отеля обязателен';
                } else if (isNaN(value) || parseInt(value) <= 0 || !Number.isInteger(Number(value))) {
                    error = 'ID отеля должен быть положительным целым числом';
                }
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: name === 'roomNumber' || name === 'capacity' || name === 'hotelId'
                ? (value === '' ? '' : parseInt(value))
                : name === 'unitPrice'
                    ? (value === '' ? '' : parseFloat(value))
                    : value
        }));

        // Сбрасываем ошибки валидации при изменении поля
        if (submitAttempted && validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        Object.keys(editData).forEach(key => {
            const error = validateField(key, editData[key]);
            if (error) {
                errors[key] = error;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5221/api/rooms/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setRoom(response.data);
                setEditData({
                    roomNumber: response.data.roomNumber,
                    description: response.data.description,
                    capacity: response.data.capacity,
                    unitPrice: response.data.unitPrice,
                    hotelId: response.data.hotelId
                });
            } catch (err) {
                console.error("Ошибка при загрузке комнаты:", err);
                setError(err.response?.data?.message || "Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [roomId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                roomNumber: parseInt(editData.roomNumber),
                description: editData.description.trim(),
                capacity: parseInt(editData.capacity),
                unitPrice: parseFloat(editData.unitPrice),
                hotelId: parseInt(editData.hotelId)
            };

            await axios.patch(
                `http://localhost:5221/api/rooms/${roomId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            setSuccess("Комната успешно обновлена");
            setTimeout(() => navigate("/room-administration"), 1500);
        } catch (err) {
            console.error("Ошибка при обновлении комнаты:", err);
            if (err.response?.status === 409) {
                setError("Комната с таким номером уже существует");
            } else {
                setError(err.response?.data?.message || "Ошибка при обновлении");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !room) return (
        <div className="container">
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка данных...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-message">
                <FaExclamationTriangle /> {error}
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Редактирование комнаты</h1>

            <div className="form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> {success}
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>
                            <FaHotel /> Номер комнаты*
                        </label>
                        <input
                            type="number"
                            name="roomNumber"
                            value={editData.roomNumber}
                            onChange={handleChange}
                            className={`form-input ${submitAttempted && validationErrors.roomNumber ? 'input-error' : ''}`}
                        />
                        {submitAttempted && validationErrors.roomNumber && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.roomNumber}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> Описание*
                        </label>
                        <textarea
                            name="description"
                            value={editData.description}
                            onChange={handleChange}
                            className={`form-input ${submitAttempted && validationErrors.description ? 'input-error' : ''}`}
                        />
                        {submitAttempted && validationErrors.description && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.description}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> Вместимость*
                        </label>
                        <input
                            type="number"
                            name="capacity"
                            value={editData.capacity}
                            onChange={handleChange}
                            className={`form-input ${submitAttempted && validationErrors.capacity ? 'input-error' : ''}`}
                        />
                        {submitAttempted && validationErrors.capacity && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.capacity}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> Цена за ночь*
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="unitPrice"
                            value={editData.unitPrice}
                            onChange={handleChange}
                            className={`form-input ${submitAttempted && validationErrors.unitPrice ? 'input-error' : ''}`}
                        />
                        {submitAttempted && validationErrors.unitPrice && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.unitPrice}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaHotel /> ID отеля*
                        </label>
                        <input
                            type="number"
                            name="hotelId"
                            value={editData.hotelId}
                            onChange={handleChange}
                            className={`form-input ${submitAttempted && validationErrors.hotelId ? 'input-error' : ''}`}
                        />
                        {submitAttempted && validationErrors.hotelId && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.hotelId}
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : <><FaSave /> Сохранить</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Стили остаются без изменений */}
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

                .form-card {
                    width: 700px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin: 0 auto;
                    border-left: 4px solid #2980b9;
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

                .form-input {
                    width: 90%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: #1a1a1a;
                }

                .form-input.input-error {
                    border-color: #e74c3c;
                    background-color: #fff9f9;
                }

                textarea.form-input {
                    min-height: 100px;
                    resize: vertical;
                }

                .form-input:focus {
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

                @media (max-width: 600px) {
                    .container {
                        padding: 15px;
                    }

                    .form-card {
                        padding: 15px;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default EditRoom;