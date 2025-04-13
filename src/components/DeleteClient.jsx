import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar.jsx";

const DeleteClient = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { guestId, clientId } = useParams();
    const navigate = useNavigate();

    console.log(guestId);
    console.log(password);

    const handleDeleteAccount = async () => {
        if (!password) {
            setError("Пароль не может быть пустым.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Верификация пароля
            const verifyResponse = await axios.post("http://localhost:5221/api/auths/verify-client", {
                clientId,
                password
            });


            if (verifyResponse.status === 200) {
                const deleteResponse = await axios.delete(`http://localhost:5221/api/clients/${guestId}/guest`);

                if (deleteResponse.status === 200) {
                    alert("Ваш аккаунт был успешно удален.");
                    navigate("/login");
                } else {
                    setError("Произошла ошибка при удалении аккаунта.");
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Неверный пароль.");
            } else {
                setError("Ошибка при верификации пароля.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <Navbar/>
            <h3>Подтвердите удаление аккаунта</h3>
            <p>Для удаления аккаунта введите ваш пароль:</p>

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                style={styles.input}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button onClick={handleDeleteAccount} style={styles.deleteButton} disabled={loading}>
                {loading ? "Удаление..." : "Удалить аккаунт"}
            </button>
        </div>
    );
};

const styles = {
    container: {
        padding: "100px",
        borderRadius: "10px",
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        width: "300px",
        margin: "auto",
        textAlign: "center"
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
    deleteButton: {
        padding: "10px 20px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px"
    },
    error: {
        color: "red",
        fontSize: "14px",
        marginTop: "10px"
    }
};

export default DeleteClient;
