import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaCreditCard, FaPiggyBank, FaExclamationTriangle, FaCheck } from "react-icons/fa";

const AddCard = () => {
    const [cardData, setCardData] = useState({
        cardNumber: "",
        cardDate: "",
        bankId: null,
    });
    const [clientId, setClientId] = useState(null);
    const [guestData, setGuestData] = useState(null);
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
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

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
        return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'cardNumber') {
            const formattedValue = formatCardNumber(value);
            setCardData(prev => ({ ...prev, [name]: formattedValue }));
        }
        else if (name === 'cardDate') {
            let cleanedValue = value.replace(/\D/g, '');
            if (cleanedValue.length > 2) {
                cleanedValue = cleanedValue.substring(0, 2) + '/' + cleanedValue.substring(2, 4);
            }
            setCardData(prev => ({ ...prev, [name]: cleanedValue }));
        }
        else {
            setCardData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!cardData.cardNumber || !/^[0-9]{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
            errors.cardNumber = "Номер карты должен содержать ровно 16 цифр";
            isValid = false;
        }

        if (!cardData.cardDate || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardData.cardDate)) {
            errors.cardDate = "Укажите срок действия в формате ММ/ГГ (например, 05/25)";
            isValid = false;
        } else if (!isValidExpiryDate(cardData.cardDate)) {
            errors.cardDate = "Срок действия карты истек или неверен";
            isValid = false;
        }

        if (!cardData.bankId) {
            errors.bankId = "Выберите банк";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Проверка срока действия карты
    const isValidExpiryDate = (expiryDate) => {
        if (!expiryDate || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryDate)) {
            return false;
        }

        const [month, year] = expiryDate.split('/');
        const expiry = new Date(parseInt(`20${year}`, 10), parseInt(month, 10));
        const currentDate = new Date();

        // Установим дату на последний день месяца
        expiry.setMonth(expiry.getMonth() + 1);
        expiry.setDate(0);

        return expiry > currentDate;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`http://localhost:5221/api/guests/${clientId}`);
            setGuestData(response.data);

            const payload = {
                cardNumber: cardData.cardNumber.replace(/\s/g, ''),
                cardDate: cardData.cardDate,
                bankId: parseInt(cardData.bankId, 10),
                guestId: parseInt(response.data.id, 10),
            };

            await axios.post("http://localhost:5221/api/cards", payload);
            setSuccess(true);
            setTimeout(() => navigate("/guest-profile"), 1500);
        } catch (err) {
            console.error("Ошибка при добавлении карты:", err);
            setError(err.response?.data?.message || "Не удалось добавить карту");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await axios.get("http://localhost:5221/api/banks");
                setBanks(response.data);
            } catch (err) {
                console.error("Ошибка при загрузке банков:", err);
                setError("Не удалось загрузить список банков");
            }
        };

        fetchBanks();
    }, []);

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Добавление карты...</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Добавление карты</h1>

            <div className="card-form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> Карта успешно добавлена!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FaCreditCard /> Номер карты
                        </label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={cardData.cardNumber}
                            onChange={handleChange}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            className={submitAttempted && validationErrors.cardNumber ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.cardNumber && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.cardNumber}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaCreditCard /> Срок действия
                        </label>
                        <input
                            type="text"
                            name="cardDate"
                            value={cardData.cardDate}
                            onChange={handleChange}
                            placeholder="ММ/ГГ"
                            maxLength={5}
                            className={submitAttempted && validationErrors.cardDate ? "input-error" : ""}
                        />
                        {submitAttempted && validationErrors.cardDate && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.cardDate}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaPiggyBank /> Банк
                        </label>
                        <div className="select-wrapper">
                            <select
                                name="bankId"
                                value={cardData.bankId || ""}
                                onChange={handleChange}
                                className={submitAttempted && validationErrors.bankId ? "input-error" : ""}
                            >
                                <option value="">Выберите банк</option>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {submitAttempted && validationErrors.bankId && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.bankId}
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="spinner" /> : "Привязать карту"}
                        </button>
                    </div>

                    {error && (
                        <div className="form-error">
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}
                </form>
            </div>

            <style jsx>{`
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
                }

                .card-form-card {
                    background: white;
                    border-radius: 10px;
                    width: 600px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin: 0 auto;
                    border-left: 4px solid #2980b9;
                    border-top: 1px solid #e0e0e0;
                    border-right: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
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

                .form-group input,
                .select-wrapper {
                    width: 100%;
                    box-sizing: border-box;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: black;
                }

                .form-group input.input-error,
                .form-group select.input-error {
                    border-color: #e74c3c;
                    background-color: #fff9f9;
                }

                .form-group select {
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 15px center;
                    background-size: 1em;
                }

                .form-group input:focus,
                .form-group select:focus {
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

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
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

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2980b9;
                }

                .btn-primary:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }

                .form-error {
                    background-color: #fdecea;
                    padding: 12px;
                    border-radius: 6px;
                    color: #e74c3c;
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                @media (max-width: 600px) {
                    .card-form-card {
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

export default AddCard;