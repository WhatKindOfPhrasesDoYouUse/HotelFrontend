import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";

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
            <Navbar />
            <h2>Профиль  {userData.name}</h2>
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
    }
};

export default GuestProfile;
