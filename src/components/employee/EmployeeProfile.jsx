import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import { FaUser, FaEnvelope, FaPhone, FaUserTie, FaIdCard, FaTasks, FaSpinner, FaHistory, FaExclamationTriangle } from "react-icons/fa";

const EmployeeProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Пользователь не авторизован");
            setLoading(false);
            return;
        }

        const decodedToken = jwtDecode(token);
        axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/employee`)
            .then((response) => {
                setUserData(response.data);
            })
            .catch((err) => {
                setError("Ошибка загрузки данных");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container">
                <Navbar />
                <div className="loading-spinner">
                    <FaSpinner className="spinner" /> Загрузка данных...
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

    if (!userData) {
        return (
            <div className="container">
                <Navbar />
                <div className="error-message">
                    <FaExclamationTriangle /> Данные пользователя не найдены
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar/>

            <br/>
            <br/>

            <div className="profile-card">
                <h1 className="profile-title">
                    <FaUserTie/> Профиль сотрудника
                </h1>

                <div className="profile-info">
                    <div className="info-item">
                        <FaUser/> <span className="info-label">ФИО:</span>
                        {userData.surname} {userData.name} {userData.patronymic}
                    </div>
                    <div className="info-item">
                        <FaEnvelope/> <span className="info-label">Email:</span>
                        {userData.email}
                    </div>
                    <div className="info-item">
                        <FaPhone/> <span className="info-label">Телефон:</span>
                        {userData.phoneNumber}
                    </div>
                    <div className="info-item">
                        <FaUserTie/> <span className="info-label">Роль:</span>
                        Уборщик
                    </div>
                </div>

                <div className="employee-controls">
                    <h2 className="controls-title">Панель задач</h2>

                    <div className="controls-grid">
                        <Link to={`/task-tracker/${userData.id}`} className="control-card">
                            <FaTasks/>
                            <span>Запросы на услуги</span>
                        </Link>

                        <Link to={`/task-in-progress/${userData.id}`} className="control-card">
                            <FaSpinner/>
                            <span>Задачи в работе</span>
                        </Link>

                        <Link to={`/done-tasks/${userData.id}`} className="control-card">
                            <FaHistory/>
                            <span>Архив задач</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .profile-card {
                    background: #fff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                }

                .profile-title {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .profile-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }

                .info-item {
                    margin: 15px 0;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .info-label {
                    font-weight: 600;
                    color: black;
                    min-width: 100px;
                }

                .controls-title {
                    text-align: center;
                    color: #2c3e50;
                    margin: 30px 0;
                }

                .controls-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .control-card {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 8px;
                    text-align: center;
                    transition: all 0.3s ease;
                    color: #2c3e50;
                    text-decoration: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    min-height: 120px;
                    justify-content: center;
                }

                .control-card:hover {
                    background: #e9ecef;
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .control-card svg {
                    font-size: 2rem;
                    color: #3498db;
                }

                .control-card span {
                    font-weight: 500;
                    font-size: 1.1rem;
                }

                .loading-spinner {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    padding: 50px;
                    font-size: 1.2rem;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                .error-message {
                    background-color: #fdecea;
                    color: #e74c3c;
                    padding: 15px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                    margin: 20px 0;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default EmployeeProfile;