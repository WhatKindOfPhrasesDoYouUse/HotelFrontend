import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "../../Navbar.jsx";
import { FaCheck, FaExclamationTriangle, FaHotel, FaSpinner, FaTrash, FaPlus, FaEdit} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RoomComfortAdministration = () => {
    const [roomComforts, setRoomComforts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const fetchRoomComforts = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5221/api/room-comforts', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRoomComforts(response.data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApiError = (err) => {
        if (err.response) {
            switch (err.response.status) {
                case 401:
                    setError("Пользователь не авторизован");
                    break;
                case 403:
                    setError("Недостаточно прав");
                    break;
                case 404:
                    setError("Данные не найдены");
                    break;
                default:
                    setError(`Ошибка сервера: ${err.response.status}`);
            }
        } else if (err.request) {
            setError("Сервер не отвечает");
        } else {
            setError(`Ошибка: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchRoomComforts();
    }, []);

    const handleDelete = async (roomId, comfortId) => {
        const confirmDelete = window.confirm(`Вы действительно хотите удалить комфорт из комнаты?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5221/api/room-comforts/${roomId}/${comfortId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess("Комфорт комнаты успешно удален");
            setTimeout(() => setSuccess(null), 3000);
            // Обновляем список после удаления
            fetchRoomComforts();
        } catch (err) {
            handleApiError(err);
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

    return (
        <div className="container">
            <Navbar/>

            <br/>
            <br/>

            <div className="header">
                <FaHotel className="header-icon"/>
                <h1>Управление комфортом комнат</h1>
            </div>

            {error && (
                <div className="error-message">
                    <FaExclamationTriangle/> {error}
                    <button
                        className="btn-retry"
                        onClick={fetchRoomComforts}
                    >
                        Попробовать снова
                    </button>
                </div>
            )}

            {success && (
                <div className="success-message">
                    <FaCheck/> {success}
                </div>
            )}

            <div className="card">
                {roomComforts.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                            <tr>
                                <th>ID комнаты</th>
                                <th>Номер комнаты</th>
                                <th>ID комфорта</th>
                                <th>Название комфорта</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {roomComforts.map((roomComfort) => (
                                <tr key={`${roomComfort.room.id}-${roomComfort.comfort.id}`}>
                                    <td>{roomComfort.room.id}</td>
                                    <td>{roomComfort.room.roomNumber}</td>
                                    <td>{roomComfort.comfort.id}</td>
                                    <td>{roomComfort.comfort.name}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(roomComfort.room.id, roomComfort.comfort.id)}
                                        >
                                            <FaTrash/> Удалить
                                        </button>

{/*                                        <button
                                            className="btn btn-edit"
                                            onClick={() => navigate(`/edit-room-comfort/${roomComfort.room.id}/${roomComfort.comfort.id}`)}
                                        >
                                            <FaEdit/> Редактировать
                                        </button>*/}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data">
                    Нет данных о комфорте комнат
                        <button
                            className="btn-refresh"
                            onClick={fetchRoomComforts}
                        >
                            Обновить данные
                        </button>
                    </div>
                )}

                <div className="actions-footer">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/add-room-comfort')}
                    >
                        <FaPlus/> Добавить комфорт к комнате
                    </button>
                </div>
            </div>

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

                .header-icon {
                    font-size: 32px;
                    color: #2980b9;
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

                .card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    border-left: 4px solid #2980b9;
                }

                .table-container {
                    overflow-x: auto;
                    margin-bottom: 20px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }

                th, td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }

                th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #2c3e50;
                }

                .actions-cell {
                    text-align: center;
                }

                .btn {
                    padding: 8px 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2980b9;
                }

                .btn-delete {
                    background-color: #e74c3c;
                    color: white;
                }

                .btn-delete:hover {
                    background-color: #c0392b;
                }

                .btn-edit {
                    background-color: #f1c40f;
                    color: white;
                    margin-right: 10px;
                }

                .btn-edit:hover {
                    background-color: #d4ac0d;
                }
                
                .btn-retry, .btn-refresh {
                    background-color: #f39c12;
                    color: white;
                    padding: 8px 16px;
                    margin-top: 10px;
                }

                .btn-retry:hover, .btn-refresh:hover {
                    background-color: #d35400;
                }

                .no-data {
                    text-align: center;
                    padding: 20px;
                    color: #7f8c8d;
                    background-color: #f8f9fa;
                    border-radius: 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }

                .actions-footer {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 15px;
                    }

                    h1 {
                        font-size: 24px;
                    }

                    th, td {
                        padding: 8px;
                        font-size: 14px;
                    }

                    .btn {
                        padding: 6px 10px;
                        font-size: 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default RoomComfortAdministration;