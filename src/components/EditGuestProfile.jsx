import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const EditGuestProfile = () => {
    const [userData, setUserData] = useState(null);
    const [guestData, setGuestData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        patronymic: '',
        surname: '',
        email: '',
        phoneNumber: '',
        cityOfResidence: '',
        dateOfBirth: '',
        passportSeriesHash: '',
        passportNumberHash: '',
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        const getUserDataFromToken = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const response = await axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`);

                    setUserData(response.data);
                    setGuestData(response.data.guest);

                    setEditData({
                        name: response.data.name || '',
                        patronymic: response.data.patronymic || '',
                        surname: response.data.surname || '',
                        email: response.data.email || '',
                        phoneNumber: response.data.phoneNumber || '',
                        cityOfResidence: response.data.guest?.cityOfResidence || '',
                        dateOfBirth: response.data.guest?.dateOfBirth || '',
                        passportSeriesHash: response.data.guest?.passportSeriesHash || '',
                        passportNumberHash: response.data.guest?.passportNumberHash || '',
                    });
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSaveData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);

            await axios.patch(
                `http://localhost:5221/api/clients/${decodedToken.client_id}`,
                editData
            );

            setUserData({ ...userData, ...editData });
            setGuestData({ ...guestData, ...editData });
            navigate("/guest-profile");
        } catch (err) {
            console.error("Ошибка при обновлении данных:", err);
            setError(err.response?.data?.message || "Ошибка при обновлении данных");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);


            await axios.patch(
                `http://localhost:5221/api/clients/${decodedToken.client_id}/password`,
                passwordData
            );
        } catch (err) {
            console.error("Ошибка при обновлении пароля:", err);
            setError(err.response?.data?.message || "Ошибка при обновлении пароля");
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

    return (
        <div style={styles.container}>

            <Navbar />

            <div style={styles.profileSection}>
                <h2>Редактирование профиля</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveData();
                }}>
                    <label>
                        Имя:
                        <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Фамилия:
                        <input
                            type="text"
                            name="surname"
                            value={editData.surname}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Отчество:
                        <input
                            type="text"
                            name="patronymic"
                            value={editData.patronymic}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Телефон:
                        <input
                            type="text"
                            name="phoneNumber"
                            value={editData.phoneNumber}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Город проживания:
                        <input
                            type="text"
                            name="cityOfResidence"
                            value={editData.cityOfResidence}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Дата рождения:
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={editData.dateOfBirth}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Серия паспорта:
                        <input
                            type="text"
                            name="passportSeriesHash"
                            value={editData.passportSeriesHash}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Номер паспорта:
                        <input
                            type="text"
                            name="passportNumberHash"
                            value={editData.passportNumberHash}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </label>
                    <button type="submit" style={styles.saveButton}>
                        Сохранить
                    </button>
                </form>
            </div>

            <div style={styles.passwordSection}>
                <h2>Изменить пароль</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePassword();
                }}>
                    <label>
                        Текущий пароль:
                        <input
                            type="password"
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Новый пароль:
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                        />
                    </label>
                    <label>
                        Подтвердите новый пароль:
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                        />
                    </label>
                    <button type="submit" style={styles.saveButton}>
                        Изменить пароль
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        maxWidth: "1000px",
        margin: "20px auto",
        padding: "20px",
    },
    profileSection: {
        flex: 1,
        maxWidth: "48%",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    },
    passwordSection: {
        flex: 1,
        maxWidth: "48%",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    },
    input: {
        width: "100%",
        padding: "8px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
        color: "Black",
    },
    saveButton: {
        padding: "10px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default EditGuestProfile;
