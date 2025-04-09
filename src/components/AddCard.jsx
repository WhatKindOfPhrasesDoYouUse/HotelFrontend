import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

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
            <h2>Добавить карту</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="cardNumber"
                    placeholder="Номер карты (1234567812345678)"
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
                <button type="submit" style={styles.button}>Сохранить и привязать</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",
        borderRadius: "10px",
        backgroundColor: "#f0f0f0",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)"
    },
    input: {
        display: "block",
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc"
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px"
    }
};

export default AddCard;
