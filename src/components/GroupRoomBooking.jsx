import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";

const GroupRoomBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [roomCapacity, setRoomCapacity] = useState(0);
    const [mainGuest, setMainGuest] = useState({
        checkInDate: "",
        checkOutDate: "",
        checkInTime: "",
        checkOutTime: "",
        guestId: "",
        roomId: roomId,
    });

    const [additionalGuests, setAdditionalGuests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const parseJwt = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded.client_id;
        } catch (error) {
            console.error("Ошибка при декодировании JWT:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchGuestAndRoomInfo = async () => {
            const token = localStorage.getItem("token");
            const clientId = parseJwt(token);

            if (clientId) {
                try {
                    const guestRes = await axios.get(`http://localhost:5221/api/guests/${clientId}`);
                    setMainGuest(prev => ({ ...prev, guestId: guestRes.data.id }));

                    const roomRes = await axios.get(`http://localhost:5221/api/rooms/${roomId}`);
                    setRoomCapacity(roomRes.data.capacity);

                    const additionalGuestsCount = roomRes.data.capacity - 1;
                    setAdditionalGuests(
                        Array(additionalGuestsCount).fill().map(() => ({
                            name: "",
                            surname: "",
                            patronymic: "",
                            passportSeries: "",
                            passportNumber: "",
                            dateOfBirth: ""
                        }))
                    );
                } catch (err) {
                    console.error("Ошибка при получении данных:", err);
                    setError("Не удалось загрузить данные");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("Пользователь не авторизован");
                setLoading(false);
            }
        };

        fetchGuestAndRoomInfo();
    }, [roomId]);

    const handleMainGuestChange = (e) => {
        const { name, value } = e.target;
        setMainGuest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdditionalGuestChange = (index, e) => {
        const { name, value } = e.target;
        setAdditionalGuests(prev => {
            const updatedGuests = [...prev];
            updatedGuests[index] = {
                ...updatedGuests[index],
                [name]: value
            };
            return updatedGuests;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            guestId: parseInt(mainGuest.guestId, 10),
            roomId: parseInt(mainGuest.roomId, 10),
            numberOfGuests: roomCapacity,
            checkInDate: mainGuest.checkInDate,
            checkOutDate: mainGuest.checkOutDate,
            checkInTime: mainGuest.checkInTime + ":00",
            checkOutTime: mainGuest.checkOutTime + ":00",
            additionalGuests: additionalGuests.map(guest => ({
                name: guest.name,
                surname: guest.surname,
                patronymic: guest.patronymic,
                passportSeriesHash: guest.passportSeries,
                passportNumberHash: guest.passportNumber,
                dateOfBirth: guest.dateOfBirth,
                guestId: null
            }))
        };

        console.log("Отправляемые данные:", payload);

        try {
            const response = await axios.post(
                "http://localhost:5221/api/room-bookings/group-booking",
                payload
            );
            console.log("Бронирование успешно!", response.data);
            navigate("/guest-profile");
        } catch (err) {
            console.error("Ошибка при создании бронирования:", err);
            setError(err.response?.data?.message || "Не удалось создать бронирование");
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div style={{ color: "red" }}>Ошибка: {error}</div>;

    return (
        <div style={styles.container}>
            <Navbar />
            <h2>Бронирование групповой комнаты #{roomId}</h2>
            <p style={{ fontSize: "14px", color: "#777", marginTop: "10px" }}>
                После оформления у вас будет <strong>15 минут</strong> на подтверждение бронирования.
            </p>
            <p>Вместимость комнаты: {roomCapacity} человек</p>

            <form onSubmit={handleSubmit}>
                <h3>Данные о бронировании</h3>
                <div style={styles.formGroup}>
                    <label>Дата заезда:</label>
                    <input
                        type="date"
                        name="checkInDate"
                        value={mainGuest.checkInDate}
                        onChange={handleMainGuestChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Время заезда:</label>
                    <input
                        type="time"
                        name="checkInTime"
                        value={mainGuest.checkInTime}
                        onChange={handleMainGuestChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Дата выезда:</label>
                    <input
                        type="date"
                        name="checkOutDate"
                        value={mainGuest.checkOutDate}
                        onChange={handleMainGuestChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label>Время выезда:</label>
                    <input
                        type="time"
                        name="checkOutTime"
                        value={mainGuest.checkOutTime}
                        onChange={handleMainGuestChange}
                        required
                        style={styles.input}
                    />
                </div>

                <h3>Дополнительные гости ({roomCapacity - 1} человек)</h3>
                {additionalGuests.map((guest, index) => (
                    <div key={index} style={styles.guestCard}>
                        <h4>Гость #{index + 1}</h4>
                        <div style={styles.formGroup}>
                            <label>Имя:</label>
                            <input
                                type="text"
                                name="name"
                                value={guest.name}
                                onChange={(e) => handleAdditionalGuestChange(index, e)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Фамилия:</label>
                            <input
                                type="text"
                                name="surname"
                                value={guest.surname}
                                onChange={(e) => handleAdditionalGuestChange(index, e)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Отчество:</label>
                            <input
                                type="text"
                                name="patronymic"
                                value={guest.patronymic}
                                onChange={(e) => handleAdditionalGuestChange(index, e)}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Серия паспорта:</label>
                            <input
                                type="text"
                                name="passportSeries"
                                value={guest.passportSeries}
                                onChange={(e) => handleAdditionalGuestChange(index, e)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Номер паспорта:</label>
                            <input
                                type="text"
                                name="passportNumber"
                                value={guest.passportNumber}
                                onChange={(e) => handleAdditionalGuestChange(index, e)}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label>Дата рождения:</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={guest.dateOfBirth}
                                onChange={(e) => handleAdditionalGuestChange(index, e)}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>
                ))}

                <button type="submit" style={styles.button}>Забронировать</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    },
    formGroup: {
        marginBottom: "15px",
    },
    input: {
        width: "100%",
        padding: "8px",
        margin: "5px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
    },
    guestCard: {
        backgroundColor: "#fff",
        padding: "15px",
        borderRadius: "5px",
        margin: "15px 0",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    button: {
        padding: "10px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "20px",
    },
};

export default GroupRoomBooking;