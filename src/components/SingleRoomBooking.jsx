import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar.jsx";

const SingleRoomBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        checkInDate: "",
        checkOutDate: "",
        checkInTime: "",
        checkOutTime: "",
        guestId: "",
        numberOfGuests: 1,
        roomId: roomId,
    });
    const [error, setError] = useState(null);

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
        const fetchGuestId = async () => {
            const token = localStorage.getItem("token");
            const clientId = parseJwt(token);

            if (clientId) {
                try {
                    const res = await axios.get(`http://localhost:5221/api/guests/${clientId}`);
                    setForm((prev) => ({ ...prev, guestId: res.data.id }));
                } catch (err) {
                    console.error("Ошибка при получении данных гостя:", err);
                    setError("Не удалось получить данные гостя.");
                }
            } else {
                console.error("Не удалось получить client_id из токена");
                setError("Пользователь не авторизован.");
            }
        };

        fetchGuestId();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedCheckInTime = form.checkInTime + ":00";
        const formattedCheckOutTime = form.checkOutTime + ":00";

        const payload = {
            checkInDate: form.checkInDate,
            checkOutDate: form.checkOutDate,
            checkInTime: formattedCheckInTime,
            checkOutTime: formattedCheckOutTime,
            numberOfGuests: 1,
            guestId: form.guestId,
            roomId: parseInt(form.roomId, 10),
        };

        console.log("Данные для отправки:", payload);

        try {
            const response = await axios.post("http://localhost:5221/api/room-bookings/single-booking", payload);
            console.log("Бронирование успешно!", response.data);
            navigate("/guest-profile");
        } catch (err) {
            console.error("Ошибка при создании бронирования:", err);
            setError("Не удалось создать бронирование");
        }
    };

    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

    return (
        <div style={styles.container}>
            <Navbar/>
            <p style={{fontSize: "14px", color: "#777", marginTop: "10px"}}>
                После оформления у вас будет <strong>15 минут</strong> на подтверждение бронирования.
            </p>
            <h2>Бронирование комнаты #{roomId}</h2>
            <form onSubmit={handleSubmit}>
                <label>Дата заезда:</label>
                <input
                    type="date"
                    name="checkInDate"
                    value={form.checkInDate}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label>Время заезда:</label>
                <input
                    type="time"
                    name="checkInTime"
                    value={form.checkInTime}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label>Дата выезда:</label>
                <input
                    type="date"
                    name="checkOutDate"
                    value={form.checkOutDate}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label>Время выезда:</label>
                <input
                    type="time"
                    name="checkOutTime"
                    value={form.checkOutTime}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <label>Количество гостей:</label>
                <input
                    type="number"
                    name="numberOfGuests"
                    value={form.numberOfGuests}
                    onChange={handleChange}
                    min="1"
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>Забронировать</button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f5f5f5",
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
    button: {
        padding: "10px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    error: {
        color: "red",
    },
};

export default SingleRoomBooking;
