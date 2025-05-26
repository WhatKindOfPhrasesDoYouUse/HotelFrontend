import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import { FaUser, FaEnvelope, FaPhone, FaUserShield, FaHotel, FaCreditCard, FaBed, FaWifi, FaUsers, FaUserTie, FaStar, FaMoneyBillWave, FaBuilding, FaKey } from "react-icons/fa";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const AdminProfile = () => {
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
                    <FaUserShield/> Профиль администратора
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
                        <FaUserShield/> <span className="info-label">Роль:</span>
                        {userData.role}
                    </div>
                </div>

                <div className="admin-controls">
                    <h2 className="controls-title">Панель управления</h2>

                    <div className="controls-grid">
                        <Link to="/hotel-types-administration" className="control-card">
                            <FaBuilding/>
                            <span>Типы отелей</span>
                        </Link>

                        <Link to="/payment-room-administration" className="control-card">
                            <FaMoneyBillWave/>
                            <span>Оплаты комнат</span>
                        </Link>

                        <Link to="/payment-amenity-administration" className="control-card">
                            <FaMoneyBillWave/>
                            <span>Оплаты услуг</span>
                        </Link>

                        <Link to="/bank-administration" className="control-card">
                            <FaCreditCard/>
                            <span>Банки</span>
                        </Link>

                        <Link to="/payment-type-administration" className="control-card">
                            <FaMoneyBillWave/>
                            <span>Типы оплаты</span>
                        </Link>

                        <Link to="/hotel-review-administration" className="control-card">
                            <FaStar/>
                            <span>Отзывы об отеле</span>
                        </Link>

                        <Link to="/amenity-review-administration" className="control-card">
                            <FaStar/>
                            <span>Отзывы об услугах</span>
                        </Link>

                        <Link to="/employee-type-administration" className="control-card">
                            <FaUserTie/>
                            <span>Типы сотрудников</span>
                        </Link>

                        <Link to="/room-administration" className="control-card">
                            <FaBed/>
                            <span>Комнаты</span>
                        </Link>

                        <Link to="/card-administration" className="control-card">
                            <FaCreditCard/>
                            <span>Карты</span>
                        </Link>

                        <Link to="/comfort-administration" className="control-card">
                            <FaWifi/>
                            <span>Комфорт</span>
                        </Link>

                        <Link to="/room-comfort-administration" className="control-card">
                            <FaBed/>
                            <span>Комфорт комнат</span>
                        </Link>

                        <Link to="/guest-administration" className="control-card">
                            <FaUsers/>
                            <span>Гостевые аккаунты</span>
                        </Link>

                        <Link to="/employee-administration" className="control-card">
                            <FaUserTie/>
                            <span>Сотрудники</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .container {
                    max-width: 1200px;
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
                    min-width: 80px;
                }

                .controls-title {
                    text-align: center;
                    color: #2c3e50;
                    margin: 30px 0;
                }

                .controls-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                }

                .control-card {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    transition: all 0.3s ease;
                    color: #2c3e50;
                    text-decoration: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
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

export default AdminProfile;