import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaExclamationTriangle, FaTrash } from "react-icons/fa";

const DeleteClient = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { guestId, clientId } = useParams();
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (!password) {
            setError("Пароль не может быть пустым");
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
                    alert("Ваш аккаунт был успешно удален");
                    navigate("/login");
                } else {
                    setError("Произошла ошибка при удалении аккаунта");
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Неверный пароль");
            } else {
                setError("Ошибка при верификации пароля");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Navbar/>
            <h1>Удаление аккаунта</h1>
            <div className="delete-card">
                <p className="warning-text">
                    Внимание! Это действие необратимо. Все ваши данные будут безвозвратно удалены.
                </p>

                <div className="form-group">
                    <label>Для подтверждения введите ваш пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        className="form-input"
                    />
                </div>

                {error && (
                    <div className="error-message">
                        <FaExclamationTriangle/> {error}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        onClick={handleDeleteAccount}
                        className="btn btn-danger"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="spinner"/> Удаление...
                            </>
                        ) : (
                            <>
                                <FaTrash/> Удалить аккаунт
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                .delete-card {
                    background: white;
                    border-radius: 10px;
                    width: 600px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin: 0 auto;
                    border-left: 4px solid #e74c3c;
                    border-top: 1px solid #e0e0e0;
                    border-right: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
                }

                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 20px;
                    font-weight: 600;
                    font-size: 28px;
                }

                .warning-text {
                    color: #e74c3c;
                    text-align: center;
                    margin-bottom: 25px;
                    font-weight: 500;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-weight: 500;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .form-input {
                    width: 90%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: black;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
                }

                .error-message {
                    background-color: #fdecea;
                    padding: 12px;
                    border-radius: 6px;
                    color: #e74c3c;
                    margin: 20px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .form-actions {
                    display: flex;
                    justify-content: center;
                    margin-top: 30px;
                }

                .btn {
                    padding: 12px 25px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 1rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-danger {
                    background-color: #e74c3c;
                    color: white;
                }

                .btn-danger:hover {
                    background-color: #c0392b;
                }

                .btn-danger:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 600px) {
                    .delete-card {
                        width: 100%;
                    }

                    .form-actions {
                        justify-content: center;
                    }

                    .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default DeleteClient;