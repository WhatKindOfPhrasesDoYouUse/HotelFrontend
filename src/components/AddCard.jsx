import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";

const AddCard = () => {
    const [cardData, setCardData] = useState({
        cardNumber: "",
        cardDate: "",
        bankId: null,
    });
    const [clientId, setClientId] = useState(null);
    const [guestData, setGuestData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwtDecode(token);
            setClientId(decodedToken.client_id);
        } else {
            setError("Пользователь не авторизован");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCardData({ ...cardData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!clientId) {
            setError("ID гостя не найден");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5221/api/guests/${clientId}`);
            setGuestData(response.data);

            console.log("Ответ от гостя:", response.data);

            const payload = {
                ...cardData,
                bankId: parseInt(cardData.bankId, 10),
                guestId: parseInt(guestData.id, 10),
            };

            console.log("Отправляемые данные:", payload);

            const createResponse = await axios.post("http://localhost:5221/api/cards", payload);
            console.log("Ответ от сервера:", createResponse);

            navigate("/guest-profile");
        } catch (err) {
            console.error("Ошибка при добавлении карты:", err);
            setError(err.response?.data?.message || "Не удалось добавить карту");
        }
    };

    return (
        <div style={styles.container}>
            <Navbar/>
            <h2>Добавить карту</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="cardNumber"
                    placeholder="Номер карты"
                    value={cardData.cardNumber}
                    onChange={handleChange}
                    required
                    pattern="\d{16}"
                    title="Введите 16-значный номер карты"
                    style={styles.input}
                />
                <input
                    type="text"
                    name="cardDate"
                    placeholder="Срок действия (MM/YY)"
                    value={cardData.cardDate}
                    onChange={handleChange}
                    required
                    pattern="\d{2}/\d{2}"
                    title="Введите срок действия в формате MM/YY"
                    style={styles.input}
                />
                <input
                    type="number"
                    name="bankId"
                    placeholder="ID банка (например: 1)"
                    value={cardData.bankId}
                    onChange={handleChange}
                    required
                    min="1"
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Привязать карту</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "250px",
        margin: "0 auto",
        padding: "100px",
        borderRadius: "10px",
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
        color: "Black"
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "10px"
    }
};

export default AddCard;
