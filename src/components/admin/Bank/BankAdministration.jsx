import {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import Navbar from "../../Navbar.jsx";
import {FaCheck, FaExclamationTriangle, FaHotel, FaSpinner, FaTrash, FaPlus, FaEdit} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";


const BankAdministration = () => {
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotelTypes = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError("Не удалось получить токен");
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);

                if (!decodedToken.role.includes("Administrator")) {
                    setError("Недостаточно прав");
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5221/api/banks');

                setBanks(response.data)
            } catch (err) {
                if (err.response) {
                    switch (err.response.status) {
                        case 401:
                            setError("Пользователь не авторизован");
                            break;
                        case 403:
                            setError("Недостаточно прав");
                            break;
                        case 404:
                            setError("Отели не найдены");
                            break;
                        default:
                            setError(`Произошла ошибка сервера: ${err.response.status}`);
                    }
                } else if (err.request) {
                    setError("Сервер не отвечает. Проверьте подключение к интернету.");
                } else {
                    setError(`Произошла непредвиденная ошибка: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHotelTypes();
    }, []);

    const handleDelete = async (bankId) => {
        const confirmDelete = window.confirm(`Вы действительно хотите удалить тип отеля с ID ${bankId}?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5221/api/banks/${bankId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setBanks(prev => prev.filter(ht => ht.id !== bankId));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError("Неверный запрос");
                        break;
                    case 404:
                        setError("Тип отеля не найден");
                        break;
                    case 500:
                        setError("Ошибка сервера при удалении");
                        break;
                    default:
                        setError(`Ошибка: ${err.response.status}`);
                }
            } else {
                setError("Ошибка при подключении к серверу");
            }
        }
    };


    if (loading) {
        return (
            <div className="container">
                <Navbar />
                <div className="loading-spinner">
                    <FaSpinner className="spinner" />
                    <p>Загрузка данных отелей...</p>
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

    return (
        <div className="container">
            <Navbar/>

            <br/>
            <br/>

            <div className="header">
                <FaHotel className="header-icon"/>
                <h1>Управление списков банков</h1>
            </div>

            {success && (
                <div className="success-message">
                    <FaCheck/> Операция выполнена успешно!
                </div>
            )}

            {banks.length > 0 ? (
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Название</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {banks.map((bank) => (
                                <tr key={bank.id}>
                                    <td>{bank.id}</td>
                                    <td>{bank.name}</td>
                                    <td className="actions-cell">
                                        <div className="actions">
                                            <button className="btn btn-delete"
                                                    onClick={() => handleDelete(bank.id)}>
                                                <FaTrash/> Удалить
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/edit-bank/${bank.id}`)}
                                            style={{
                                                backgroundColor: '#4CAF50',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaEdit/> Редактировать
                                        </button>

                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{textAlign: 'right'}}>
                        <button onClick={() => navigate('/add-bank')}
                                style={{backgroundColor: '#3498db', color: 'white'}}>
                            <FaPlus/> Перейти
                        </button>
                    </div>

                </div>
            ) : (
                <div className="no-data">Нет данных о банках</div>
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

                th, td {
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

                .actions-header {
                    text-align: center;
                }

                tr:hover {
                    background-color: #f5f5f5;
                }

                .hotel-name {
                    font-weight: 500;
                    color: #2980b9;
                }

                .description-cell {
                    max-width: 300px;
                }

                .description-content {
                    max-height: 60px;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                }

                .description-content.expanded {
                    max-height: 500px;
                    overflow-y: auto;
                }

                .description-content p {
                    margin: 0 0 10px 0;
                    line-height: 1.5;
                }

                .toggle-description {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: none;
                    border: none;
                    color: #3498db;
                    cursor: pointer;
                    padding: 5px 0;
                    font-size: 13px;
                    margin-top: 5px;
                }

                .toggle-description:hover {
                    text-decoration: underline;
                }

                .rating {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 13px;
                }

                .rating-1 {
                    background-color: #ffebee;
                    color: #f44336;
                }

                .rating-2 {
                    background-color: #fff8e1;
                    color: #ffa000;
                }

                .rating-3 {
                    background-color: #e8f5e9;
                    color: #4caf50;
                }

                .rating-4 {
                    background-color: #e3f2fd;
                    color: #2196f3;
                }

                .rating-5 {
                    background-color: #f3e5f5;
                    color: #9c27b0;
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

                .btn-edit {
                    background-color: #3498db;
                    color: white;
                }

                .btn-edit:hover {
                    background-color: #2980b9;
                }

                .btn-delete {
                    background-color: #e74c3c;
                    color: white;
                }

                .btn-delete:hover {
                    background-color: #c0392b;
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

                    th, td {
                        padding: 8px 10px;
                        font-size: 13px;
                    }

                    .btn {
                        padding: 6px 8px;
                    }

                    .description-cell {
                        max-width: 200px;
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

export default BankAdministration;