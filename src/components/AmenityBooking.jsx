import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";

const AmenityBooking = () => {
    const { amenityId } = useParams();
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        quantity: 1
    });
    const [amenity, setAmenity] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Пользователь не авторизован");
                    setLoading(false);
                    return;
                }

                const decoded = jwtDecode(token);
                const guestResponse = await axios.get(`http://localhost:5221/api/guests/${decoded.client_id}`);
                setGuestId(guestResponse.data.id);

                const amenityResponse = await axios.get(`http://localhost:5221/api/amenities/${amenityId}`);
                setAmenity(amenityResponse.data);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError(err.response?.data?.message || "Произошла ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [amenityId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!guestId) {
            setError("Не удалось идентифицировать гостя");
            return;
        }

        try {
            const payload = {
                amenityId: amenityId,
                guestId: guestId,
                quantity: parseInt(form.quantity, 10)
            };

            await axios.post('http://localhost:5221/api/amenity-bookings', payload);
            alert("Услуга успешно заказана!");
        } catch (err) {
            console.error("Ошибка при заказе услуги:", err);
            setError(err.response?.data?.message || "Произошла ошибка при заказе услуги");
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <Navbar />
                <p>Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <Navbar />
                <p style={{ color: "red" }}>{error}</p>
            </div>
        );
    }

    if (!amenity) {
        return (
            <div style={styles.container}>
                <Navbar />
                <p style={{ color: "red" }}>Услуга не найдена</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Navbar />
            <p style={{ fontSize: "14px", color: "#777", marginTop: "10px" }}>
                <strong>После заказа ждите, когда сотрудник возьмется за услугу</strong>
            </p>

            <h2>Бронирование услуги: {amenity.name}</h2>

            <div style={styles.amenityInfo}>
                <h3>Описание услуги:</h3>
                <p><strong>Название:</strong> {amenity.name} </p>
                <p><strong>Описание:</strong> {amenity.description}</p>
                <p><strong>Цена:</strong> {amenity.unitPrice} ₽ за единицу</p>
            </div>

            <form onSubmit={handleSubmit}>
                <label>Количество:</label>
                <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    style={styles.input}
                />

                <button type="submit" style={styles.button}>
                    Забронировать
                </button>
            </form>
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
    amenityInfo: {
        backgroundColor: "#fff",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
        width: "100%",
        marginTop: "10px",
    },
    error: {
        color: "red",
        marginTop: "10px",
    },
};

export default AmenityBooking;