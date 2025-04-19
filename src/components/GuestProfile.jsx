import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaCity, FaBirthdayCake, FaIdCard, FaCreditCard, FaEdit, FaTrash, FaSync, FaUnlink, FaPlus } from "react-icons/fa";

const GuestProfile = () => {
    const [userData, setUserData] = useState(null);
    const [cardData, setCardData] = useState(null);
    const [guestData, setGuestData] = useState(null);
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
        axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`)
            .then((response) => {
                setUserData(response.data);
                setGuestData(response.data.guest);
            })
            .catch((err) => {
                setError("Ошибка загрузки данных");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!guestData?.id) return;

        axios.get(`http://localhost:5221/api/cards/${guestData.id}/guest`)
            .then((res) => setCardData(res.data))
            .catch((err) => {
                console.error("Ошибка загрузки карты", err);
                setCardData(null);
            });
    }, [guestData]);

    const handleDeleteCard = async () => {
        if (cardData) {
            try {
                await axios.delete(`http://localhost:5221/api/cards/${cardData.id}`);
                setCardData(null);
                alert("Карта успешно удалена");
            } catch (error) {
                console.error("Ошибка при удалении карты", error);
                alert("Ошибка при удалении карты");
            }
        }
    }

    const getInitials = () => {
        if (!userData?.name || !userData?.surname) return "ГС";
        return `${userData.name.charAt(0)}${userData.surname.charAt(0)}`;
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка данных профиля...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h2>Произошла ошибка</h2>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="profile-container">
            <Navbar />

            <div className="profile-header">
                <div className="avatar-container">
                    <div className="avatar-circle">
                        <span className="avatar-initials">{getInitials()}</span>
                    </div>
                </div>
                <div className="profile-title">
                    <h1>{userData?.name} {userData?.surname}</h1>
                </div>
            </div>

            <div className="profile-content">
                <div className="personal-info-section">
                    <h2 className="section-title"><FaUser /> Персональная информация</h2>

                    <div className="info-grid">
                        <div className="info-pair">
                            <span className="info-label"><FaUser /> ФИО</span>
                            <span className="info-value">{userData?.name} {userData?.surname} {userData?.patronymic}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaEnvelope /> Email</span>
                            <span className="info-value">{userData?.email}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaPhone /> Телефон</span>
                            <span className="info-value">{userData?.phoneNumber}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaCity /> Город проживания</span>
                            <span className="info-value">{guestData?.cityOfResidence}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaBirthdayCake /> Дата рождения</span>
                            <span className="info-value">
                                {guestData?.dateOfBirth ? new Date(guestData.dateOfBirth).toLocaleDateString() : '-'}
                            </span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaIdCard /> Паспорт</span>
                            <span className="info-value">
                                {guestData?.passportSeriesHash} {guestData?.passportNumberHash}
                            </span>
                        </div>
                    </div>

                    <div className="actions">
                        <Link to="/edit-guest-profile" className="btn btn-edit">
                            <FaEdit /> Редактировать профиль
                        </Link>
                        <Link to={`/delete-client/${guestData?.id}/${userData?.id}`} className="btn btn-delete">
                            <FaTrash /> Удалить аккаунт
                        </Link>
                    </div>
                </div>

                <div className="card-section">
                    <h2 className="section-title"><FaCreditCard /> Банковская карта</h2>

                    {cardData ? (
                        <>
                            <div className="card-info">
                                <div className="info-pair">
                                    <span className="info-label">Номер карты</span>
                                    <span className="info-value card-number">
                                        {cardData.cardNumber?.replace(/(\d{4})(?=\d)/g, '•••• ')} {cardData.cardNumber?.slice(-4)}
                                    </span>
                                </div>
                                <div className="info-pair">
                                    <span className="info-label">Срок действия</span>
                                    <span className="info-value">{cardData.cardDate || '-'}</span>
                                </div>
                                <div className="info-pair">
                                    <span className="info-label">Банк</span>
                                    <span className="info-value">{cardData.bankName || '-'}</span>
                                </div>
                            </div>

                            <div className="card-actions">
                                <Link to={`/edit-card/${cardData.id}`} className="btn btn-edit">
                                    <FaSync /> Обновить
                                </Link>
                                <button onClick={handleDeleteCard} className="btn btn-delete">
                                    <FaUnlink /> Отвязать
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-card">
                            <p>Карта пока не привязана</p>
                            <Link to="/add-card" className="btn btn-edit">
                                <FaPlus /> Привязать карту
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .profile-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                
                .spinner {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #4a6bff;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .error-container {
                    text-align: center;
                    padding: 40px;
                    color: #e74c3c;
                }
                
                .profile-header {
                    text-align: center;
                    margin: 30px 0;
                }
                
                .avatar-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                
                .avatar-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background-color: #4a6bff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                
                .avatar-initials {
                    line-height: 1;
                }
                
                .profile-title h1 {
                    font-size: 2rem;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                
                .loyalty-badge {
                    display: inline-block;
                    padding: 5px 15px;
                    background-color: #e3f2fd;
                    color: #4a6bff;
                    border-radius: 20px;
                    font-weight: 500;
                }
                
                .profile-content {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                
                .personal-info-section,
                .card-section {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
                    padding: 30px;
                }
                
                .section-title {
                    font-size: 1.5rem;
                    color: #2c3e50;
                    margin-bottom: 25px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #4a6bff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                
                .info-pair {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 15px;
                }
                
                .info-label {
                    font-weight: 600;
                    color: #6c757d;
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .info-value {
                    font-size: 1.1rem;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .card-number {
                    font-family: 'Courier New', monospace;
                    letter-spacing: 1px;
                }
                
                .actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 30px;
                    flex-wrap: wrap;
                }
                
                .btn {
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    border: none;
                    font-size: 1rem;
                }
                
                .btn-edit {
                    background-color: #4a6bff;
                    color: white;
                }
                
                .btn-edit:hover {
                    background-color: #3a5bef;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }
                
                .btn-delete {
                    background-color: #e74c3c;
                    color: white;
                }
                
                .btn-delete:hover {
                    background-color: #c0392b;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
                }
                
                .card-info {
                    margin-bottom: 20px;
                }
                
                .card-actions {
                    display: flex;
                    gap: 15px;
                }
                
                .no-card {
                    text-align: center;
                    padding: 20px;
                    color: #6c757d;
                }
                
                @media (max-width: 768px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .actions, .card-actions {
                        flex-direction: column;
                    }
                    
                    .profile-container {
                        padding: 10px;
                    }
                    
                    .personal-info-section,
                    .card-section {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default GuestProfile;