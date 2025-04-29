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
            <Navbar/>

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
                    <h2 className="section-title"><FaUser/> Персональная информация</h2>

                    <div className="info-grid">
                        <div className="info-pair">
                            <span className="info-label"><FaUser/> ФИО</span>
                            <span
                                className="info-value">{userData?.name} {userData?.surname} {userData?.patronymic}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaEnvelope/> Email</span>
                            <span className="info-value">{userData?.email}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaPhone/> Телефон</span>
                            <span className="info-value">{userData?.phoneNumber}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaCity/> Город проживания</span>
                            <span className="info-value">{guestData?.cityOfResidence}</span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaBirthdayCake/> Дата рождения</span>
                            <span className="info-value">
                                {guestData?.dateOfBirth ? new Date(guestData.dateOfBirth).toLocaleDateString() : '-'}
                            </span>
                        </div>
                        <div className="info-pair">
                            <span className="info-label"><FaIdCard/> Паспорт</span>
                            <span className="info-value">
                                {guestData?.passportSeriesHash} {guestData?.passportNumberHash}
                            </span>
                        </div>
                    </div>

                    <div className="actions">
                        <Link to="/edit-guest-profile" className="btn btn-edit">
                            <FaEdit/> Редактировать профиль
                        </Link>
                        <Link to={`/delete-client/${guestData?.id}/${userData?.id}`} className="btn btn-delete">
                            <FaTrash/> Удалить аккаунт
                        </Link>
                    </div>
                </div>

                <div className="card-section">
                    <h2 className="section-title"><FaCreditCard/> Банковская карта</h2>

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
                                    <FaSync/> Обновить
                                </Link>
                                <button onClick={handleDeleteCard} className="btn btn-delete">
                                    <FaUnlink/> Отвязать
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-card">
                            <p>Карта пока не привязана</p>
                            <Link to="/add-card" className="btn btn-edit">
                                <FaPlus/> Привязать карту
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .profile-container {
                    max-width: 960px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .profile-header {
                    text-align: center;
                    margin: 40px 0;
                }

                .avatar-circle {
                    width: 90px;
                    height: 90px;
                    background-color: #4a6bff;
                    color: white;
                    font-size: 30px;
                    font-weight: bold;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 15px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .profile-title h1 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2c3e50;
                }

                .profile-content {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .personal-info-section,
                .card-section {
                    background: #fff;
                    border-radius: 16px;
                    padding: 28px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s ease;
                }

                .personal-info-section:hover,
                .card-section:hover {
                    transform: translateY(-3px);
                }

                .section-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #374151;
                    border-left: 5px solid #4a6bff;
                    padding-left: 12px;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 18px;
                }

                .info-pair {
                    display: flex;
                    flex-direction: column;
                }

                .info-label {
                    font-size: 0.95rem;
                    color: #6c757d;
                    font-weight: 600;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .info-value {
                    font-size: 1.05rem;
                    border-bottom: 1px dashed #dee2e6;
                    padding-bottom: 6px;
                    color: #212529;
                }

                .actions, .card-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 25px;
                }

                .btn {
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                    cursor: pointer;
                    border: none;
                }

                .btn-edit {
                    background-color: #4a6bff;
                    color: white;
                }

                .btn-edit:hover {
                    background-color: #3750db;
                    transform: translateY(-2px);
                }

                .btn-delete {
                    background-color: #e74c3c;
                    color: white;
                }

                .btn-delete:hover {
                    background-color: #c0392b;
                    transform: translateY(-2px);
                }

                .card-number {
                    font-family: 'Courier New', Courier, monospace;
                    letter-spacing: 1px;
                }

                .no-card {
                    text-align: center;
                    color: #6c757d;
                    font-size: 1rem;
                }

                @media (max-width: 600px) {
                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .actions, .card-actions {
                        flex-direction: column;
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

export default GuestProfile;