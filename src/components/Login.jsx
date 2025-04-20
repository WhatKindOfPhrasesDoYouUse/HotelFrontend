import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaGoogle, FaFacebookF, FaSpinner, FaHotel} from "react-icons/fa";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        let errors = {};

        if (!email) errors.email = "Поле электронной почты обязательно";
        if (!password) errors.password = "Поле пароля обязательно";

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (email && !emailPattern.test(email)) {
            errors.email = "Неверный формат email";
        }

        setValidationError(errors);
        return Object.keys(errors).length === 0;
    }

    const handleViewHotels = () => {
        navigate("/hotels");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const isValid = validate();
        if (!isValid) return;

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
        <div className="auth-container">
            <div className="auth-header">
                <div className="auth-logo">
                    <FaSignInAlt />
                </div>
                <h1>Добро пожаловать</h1>
                <p>Войдите в свой аккаунт, чтобы продолжить</p>
            </div>

            <div className="auth-content">
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Электронная почта</label>
                        <div className="input-with-icon">
                            <FaEnvelope/>
                            <input
                                type="email"
                                id="email"
                                className={`form-control ${validationError.email ? 'is-invalid' : ''}`}
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationError.email && <div className="invalid-feedback">{validationError.email}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <div className="input-with-icon">
                            <FaLock/>
                            <input
                                type="password"
                                id="password"
                                className={`form-control ${validationError.password ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationError.password && <div className="invalid-feedback">{validationError.password}</div>}
                    </div>

                    <div className="remember-forgot">
                        <label className="checkbox-label">
                            <input type="checkbox" defaultChecked disabled={loading}/>
                            <span>Запомнить меня</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            Забыли пароль?
                        </Link>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <FaSpinner className="spinner"/>
                                Вход...
                            </>
                        ) : (
                            <>
                                <FaSignInAlt/>
                                Войти
                            </>
                        )}
                    </button>

                    <br/>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleViewHotels}
                        color="green"
                        disabled={loading}
                    >
                        <FaHotel/>
                        Просмотреть отель без входа
                    </button>

                </form>
            </div>

            <div className="auth-footer">
                Ещё нет аккаунта? <Link to="/guest-registration">Зарегистрироваться</Link>
            </div>

            <style jsx>{`
                .auth-container {
                    width: 100%;
                    max-width: 450px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin: 20px;
                }
                
                .auth-header {
                    background: linear-gradient(135deg, #4a6bff, #3a5bef);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .auth-header h1 {
                    font-size: 1.8rem;
                    margin-bottom: 10px;
                }
                
                .auth-header p {
                    opacity: 0.9;
                    font-size: 0.95rem;
                }
                
                .auth-logo {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                    background-color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4a6bff;
                    font-size: 28px;
                    font-weight: bold;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                
                .auth-content {
                    padding: 30px;
                }
                
                .auth-error {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 10px 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    border: 1px solid #f5c6cb;
                    font-size: 0.9rem;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #4a5568;
                }
                
                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .input-with-icon svg {
                    position: absolute;
                    left: 15px;
                    color: #a0aec0;
                }
                
                .form-control {
                    width: 100%;
                    padding: 12px 15px 12px 45px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                
                .form-control.is-invalid {
                    border-color: #e53e3e;
                }
                
                .form-control:focus {
                    outline: none;
                    border-color: #4a6bff;
                    box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
                }
                
                .invalid-feedback {
                    color: #e53e3e;
                    font-size: 0.85rem;
                    margin-top: 5px;
                }
                
                .btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .btn-primary {
                    background-color: #4a6bff;
                    color: white;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background-color: #3a5bef;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                .btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .auth-footer {
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #edf2f7;
                    font-size: 0.9rem;
                    color: #718096;
                }
                
                .auth-footer a {
                    color: #4a6bff;
                    text-decoration: none;
                    font-weight: 600;
                }
                
                .auth-footer a:hover {
                    text-decoration: underline;
                }
                
                .remember-forgot {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    color: #4a5568;
                }
                
                .checkbox-label input {
                    width: 16px;
                    height: 16px;
                    accent-color: #4a6bff;
                }
                
                .forgot-password {
                    color: #4a6bff;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                
                .forgot-password:hover {
                    text-decoration: underline;
                }
                
                .social-auth {
                    margin: 25px 0;
                }
                
                .social-auth p {
                    text-align: center;
                    color: #718096;
                    margin-bottom: 15px;
                    position: relative;
                }
                
                .social-auth p::before,
                .social-auth p::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    width: 30%;
                    height: 1px;
                    background-color: #e2e8f0;
                }
                
                .social-auth p::before {
                    left: 0;
                }
                
                .social-auth p::after {
                    right: 0;
                }
                
                .social-buttons {
                    display: flex;
                    gap: 10px;
                }
                
                .social-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid #e2e8f0;
                    background-color: white;
                    color: #4a5568;
                }
                
                .social-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
                }
                
                .social-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                @media (max-width: 480px) {
                    .auth-container {
                        margin: 10px;
                    }
                
                    .auth-header {
                        padding: 20px;
                    }
                
                    .auth-content {
                        padding: 20px;
                    }
                
                    .social-buttons {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}

export default Login;