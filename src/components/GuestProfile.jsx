import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import {Link} from "react-router-dom";

const GuestProfile = () => {
    const [userData, setUserData] = useState(null);
    const [guestData, setGuestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const getUserDataFromToken = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const response = await axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`);

                    setUserData(response.data);
                    setGuestData(response.data.guest);
                } catch (err) {
                    console.error("Ошибка при получении данных пользователя:", err);
                    setError(err.response?.data?.message || "Ошибка загрузки данных");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("Пользователь не авторизован");
                setLoading(false);
            }
        };

        getUserDataFromToken();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

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

            <br/>

            <Link to="/add-card">
                <button style={styles.editButton}>Привязать карту</button>
            </Link>

        </div>
    );
};

const styles = {
    profileContainer: {
        maxWidth: "500px",
        margin: "20px auto",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
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
    }
};

export default GuestProfile;
