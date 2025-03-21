import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setError("");
            setLoading(true);

            const response = await axios.post("http://localhost:5221/api/auths/login", {
                email,
                password
            });

            const token = response.data.token;

            if (token) {
                localStorage.setItem("token", token);
                console.log("Токен аутентификации: " + token);
                navigate("/hotels");
            } else {
                console.error("Токен аутентификации не получен");
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setError("Email и пароль обязательны.");
                        break;
                    case 404:
                        setError("Пользователь не найден.");
                        break;
                    case 401:
                        setError("Неверный email или пароль.");
                        break;
                    case 500:
                        setError(error.response.data.message || "Внутренняя ошибка сервера");
                        break;
                    default:
                        setError("Произошла неизвестная ошибка");
                }
            } else {
                setError("Ошибка сети или сервер недоступен");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Авторизация</h2>
            {error && <p style={styles.error}>{error}</p>}
            {loading && <p>Загрузка...</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
            <div style={styles.buttonContainer}>
                <button onClick={handleLogin} disabled={loading} style={styles.loginButton}>
                    {loading ? "Вход..." : "Войти"}
                </button>
            </div>
            <div style={{ marginTop: '20px' }}>
{/*                <Link to="/register">
                    <button style={styles.registerButton}>Регистрация</button>
                </Link>*/}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '400px',
        margin: '0 auto',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
    },
    error: {color: "red"},
    input: {
        width: '90%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        color: '#333'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    loginButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    registerButton: {
        padding: '10px 20px',
        backgroundColor: '#ff9800',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%'
    }
};

export default Login;

