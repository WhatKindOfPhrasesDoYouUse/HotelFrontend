import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaKey, FaExclamationTriangle, FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "./Navbar.jsx";

const ChangePassword = () => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [fieldErrors, setFieldErrors] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevState) => ({ ...prevState, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!passwordData.oldPassword) {
            errors.oldPassword = "Введите текущий пароль";
            isValid = false;
        }

        if (!passwordData.newPassword) {
            errors.newPassword = "Введите новый пароль";
            isValid = false;
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = "Пароль должен содержать минимум 6 символов";
            isValid = false;
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = "Подтвердите новый пароль";
            isValid = false;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Пароли не совпадают";
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setTouched({
            oldPassword: true,
            newPassword: true,
            confirmPassword: true,
        });

        if (!validateForm()) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);

            await axios.patch(
                `http://localhost:5221/api/clients/${decodedToken.client_id}/password`,
                passwordData
            );

            setSuccess("Пароль успешно изменен");

            setTimeout(() => {
                navigate("/guest-profile");
            }, 2000);
        } catch (err) {
            console.error("Ошибка при обновлении пароля:", err);

            if (err.response?.data?.error) {
                const errorMessage = err.response.data.error;

                if (errorMessage.includes("Старый пароль")) {
                    setFieldErrors(prev => ({ ...prev, oldPassword: errorMessage }));
                }
                else if (errorMessage.includes("Новый пароль не должен совпадать")) {
                    setFieldErrors(prev => ({ ...prev, newPassword: errorMessage }));
                }
                else if (errorMessage.includes("Новый пароль и подтверждение")) {
                    setFieldErrors(prev => ({ ...prev, confirmPassword: errorMessage }));
                }
                else {
                    setError(errorMessage);
                }
            } else {
                setError(err.response?.data?.message || "Ошибка при обновлении пароля");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка данных...</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Смена пароля</h1>

            <div className="password-form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> {success}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <FaExclamationTriangle /> {error}
                    </div>
                )}

                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label><FaKey /> Текущий пароль</label>
                        <div className="password-input-container">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.oldPassword && fieldErrors.oldPassword ? "input-error" : ""}`}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {touched.oldPassword && fieldErrors.oldPassword && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {fieldErrors.oldPassword}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label><FaKey /> Новый пароль</label>
                        <div className="password-input-container">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.newPassword && fieldErrors.newPassword ? "input-error" : ""}`}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {touched.newPassword && fieldErrors.newPassword && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {fieldErrors.newPassword}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label><FaKey /> Подтвердите пароль</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.confirmPassword && fieldErrors.confirmPassword ? "input-error" : ""}`}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {touched.confirmPassword && fieldErrors.confirmPassword && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {fieldErrors.confirmPassword}
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="spinner" /> : "Изменить пароль"}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                /* Стили те же, можешь оставить свои */
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                h1 {
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 30px;
                    font-weight: 600;
                    font-size: 28px;
                }

                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 200px;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                    font-size: 40px;
                    margin-bottom: 15px;
                    color: #3498db;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-message {
                    background-color: #fdecea;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: center;
                    color: #e74c3c;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                }

                .success-message {
                    background-color: #e8f5e9;
                    padding: 15px;
                    border-radius: 6px;
                    margin-bottom: 25px;
                    text-align: center;
                    color: #2e7d32;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                    animation: fadeIn 0.5s ease-in-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .password-form-card {
                    background: white;
                    border-radius: 10px;
                    width: 600px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin: 0 auto;
                    border-left: 4px solid #2980b9;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 500;
                    color: #2c3e50;
                    margin-bottom: 8px;
                }

                .password-input-container {
                    position: relative;
                    width: 100%;
                }

                .form-input {
                    width: 90%;
                    padding: 12px 40px 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background-color: white;
                    color: #333;
                }

                .form-input.input-error {
                    border-color: #e74c3c;
                    background-color: #fff9f9;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
                }

                .validation-error {
                    background-color: #fdecea;
                    padding: 8px 12px;
                    border-radius: 6px;
                    color: #e74c3c;
                    margin-top: 5px;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .toggle-password {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #7f8c8d;
                    padding: 5px;
                    font-size: 16px;
                    transition: color 0.2s;
                }

                .toggle-password:hover {
                    color: #3498db;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 30px;
                }

                .btn {
                    padding: 12px 30px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2980b9;
                    transform: translateY(-1px);
                }

                .btn-primary:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 600px) {
                    .password-form-card {
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

export default ChangePassword;
