import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import {Link} from "react-router-dom";

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

        console.log(guestData.id);

        axios.get(`http://localhost:5221/api/cards/${guestData.id}/guest`)
            .then((res) => setCardData(res.data))
            .catch((err) => {
                console.error("Ошибка загрузки карты", err);
                setCardData(null);
            });
    }, [guestData]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

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


    return (
        <div style={styles.profileContainer}>
            <Navbar/>

            <h2>Профиль {userData.name}</h2>
            <p><strong>ФИО:</strong> {userData?.name} {userData?.surname} {userData?.patronymic}</p>
            <p><strong>Email:</strong> {userData?.email}</p>
            <p><strong>Телефон:</strong> {userData?.phoneNumber}</p>

            {guestData && (
                <>
                    <p><strong>Город проживания:</strong> {guestData.cityOfResidence}</p>
                    <p><strong>Дата рождения:</strong> {new Date(guestData.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Лояльность:</strong> {guestData.loyaltyStatus}</p>
                    <p><strong>Паспорт:</strong> {guestData.passportSeriesHash} {guestData.passportNumberHash}</p>
                </>
            )}

            <Link to="/edit-guest-profile">
                <button style={styles.editButton}>Редактировать профиль</button>
            </Link>

            <Link to={`/delete-client/${guestData.id}/${userData.id}`}>
                <button style={styles.deleteButton}>Удалить аккаунт</button>
            </Link>

            {cardData ? (
                <div style={styles.cardSection}>
                    <h3>Информация о карте</h3>
                    <p><strong>Номер:</strong> {cardData.cardNumber}</p>
                    <p><strong>Дата:</strong> {cardData.cardDate}</p>
                    <p><strong>Банк:</strong> {cardData.bankName}</p>

                    <Link to={`/edit-card/${cardData.id}`}>
                        <button style={styles.editButton}>Обновить</button>
                    </Link>

                    <br/>

                    <button onClick={handleDeleteCard} style={styles.deleteButton}>
                        Отвязать
                    </button>
                </div>
            ) : (
                <div style={styles.cardSection}>
                    <h3>Информация о карте</h3>
                    <p style={{color: "gray"}}>Карта пока не привязана.</p>
                    <Link to="/add-card">
                        <button style={styles.editButton}>Привязать</button>
                    </Link>
                </div>
            )}
        </div>
    );
};

const styles = {
    profileContainer: {
        maxWidth: "500px",
        margin: "20px 0 20px 20px",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        left: "-100px"
    },
    editButton: {
        padding: "8px 16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        margin: "10px 0",
        fontSize: "16px"
    },
    cardSection: {
        marginTop: "20px",
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f5f5f5"
    },
    deleteButton: {
        padding: "8px 16px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        margin: "10px 0",
        fontSize: "16px",
    }
};

export default GuestProfile;
