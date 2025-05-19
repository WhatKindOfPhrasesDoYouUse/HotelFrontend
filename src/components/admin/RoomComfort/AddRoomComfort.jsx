import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaCheck, FaExclamationTriangle, FaPlus } from "react-icons/fa";
import Navbar from "../../Navbar.jsx";

const AddRoomComfort = () => {
    const [rooms, setRooms] = useState([]);
    const [comforts, setComforts] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [selectedComfortId, setSelectedComfortId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Получаем список комнат
                const roomsResponse = await axios.get('http://localhost:5221/api/rooms/hotel/1');
                setRooms(roomsResponse.data);
                console.log(roomsResponse.data);


                // Получаем список комфортов
                const comfortsResponse = await axios.get('http://localhost:5221/api/comforts');
                setComforts(comfortsResponse.data);
                console.log(comfortsResponse.data);


            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError(err.response?.data?.message || "Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedRoomId || !selectedComfortId) {
            setError("Пожалуйста, выберите комнату и комфорт");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const roomId = parseInt(selectedRoomId);
            const comfortId = parseInt(selectedComfortId);

            await axios.post(
                `http://localhost:5221/api/room-comforts/${roomId}/${comfortId}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            setSuccess("Комфорт успешно добавлен к комнате");
            setTimeout(() => navigate("/room-comfort-administration"), 1500);
        } catch (err) {
            console.error("Ошибка при добавлении комфорта:", err);
            if (err.response?.status === 409) {
                setError("Такая связка уже существует");
            } else {
                setError(err.response?.data?.message || "Не удалось добавить комфорт");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && (rooms.length === 0 || comforts.length === 0)) {
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
                    <button
                        className="btn-retry"
                        onClick={() => window.location.reload()}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />
            <h1>Добавление комфорта к комнате</h1>

            <div className="form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Комната</label>
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Выберите комнату</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    №{room.roomNumber} (ID: {room.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Комфорт</label>
                        <select
                            value={selectedComfortId}
                            onChange={(e) => setSelectedComfortId(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Выберите комфорт</option>
                            {comforts.map(comfort => (
                                <option key={comfort.id} value={comfort.id}>
                                    {comfort.name} (ID: {comfort.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="spinner" /> : <><FaPlus /> Добавить</>}
                        </button>
                    </div>
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
                    margin-bottom: 25px;
                    text-align: center;
                    color: #e74c3c;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
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
                    display: block;
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

                select.form-input {
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 1em;
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

                .btn-retry {
                    background-color: #f39c12;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .btn-retry:hover {
                    background-color: #d35400;
                }

                @media (max-width: 600px) {
                    .container {
                        padding: 15px;
                    }
                    
                    .form-card {
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AddRoomComfort;