import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const EditCard = () => {
    const { cardId } = useParams();
    const [cardData, setCardData] = useState(null);
    const [editData, setEditData] = useState({
        cardNumber: '',
        cardDate: '',
        bankId: '',
    });
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCardData = async () => {
            try {
                const response = await axios.get(`http://localhost:5221/api/cards/${cardId}`);
                setCardData(response.data);
                setEditData({
                    cardNumber: response.data.cardNumber || '',
                    cardDate: response.data.cardDate || '',
                    bankId: response.data.bankId || '',
                });
            } catch (err) {
                setError("Ошибка при загрузке данных карты");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCardData();
    }, [cardId]);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await axios.get('http://localhost:5221/api/banks');
                setBanks(response.data);
            } catch (err) {
                setError("Ошибка при загрузке списка банков");
                console.error(err);
            }
        };

        fetchBanks();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSaveData = async () => {
        setLoading(true);
        try {
            await axios.patch(
                `http://localhost:5221/api/cards/${cardId}`,
                {
                    cardNumber: editData.cardNumber,
                    cardDate: editData.cardDate,
                    bankId: editData.bankId,
                }
            );
            setCardData({ ...cardData, ...editData });
            navigate(`/guest-profile`);
        } catch (err) {
            console.error("Ошибка при обновлении данных карты:", err);
            setError("Ошибка при обновлении данных карты");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

    return (
        <div style={styles.container}>
            <Navbar/>
            <h2>Редактирование карты</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveData();
            }}>
                <label>
                    Номер карты:
                    <input
                        type="text"
                        name="cardNumber"
                        value={editData.cardNumber}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </label>
                <label>
                    Срок действия:
                    <input
                        type="text"
                        name="cardDate"
                        value={editData.cardDate}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </label>
                <label>
                    Банк:
                    <select
                        name="bankId"
                        value={editData.bankId}
                        onChange={handleChange}
                        style={styles.input}
                    >
                        <option value="">Выберите банк</option>
                        {banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit" style={styles.saveButton}>
                    Сохранить изменения
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
    input: {
        width: "100%",
        padding: "8px",
        margin: "10px 0",
        borderRadius: "5px",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
        color: "Black"
    },
    saveButton: {
        padding: "10px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    }
};

export default EditCard;
