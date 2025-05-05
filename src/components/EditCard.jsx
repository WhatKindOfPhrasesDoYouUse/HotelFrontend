import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaCreditCard, FaPiggyBank, FaExclamationTriangle, FaCheck } from "react-icons/fa";

const EditCard = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const [cardData, setCardData] = useState(null);
    const [editData, setEditData] = useState({
        cardNumber: '',
        cardDate: '',
        bankId: '',
    });
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchCardData = async () => {
            try {
                const response = await axios.get(`http://localhost:5221/api/cards/${cardId}`);
                setCardData(response.data);

                const formattedCardNumber = response.data.cardNumber?.replace(/(\d{4})(?=\d)/g, '$1 ') || '';

                setEditData({
                    cardNumber: formattedCardNumber || '',
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

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!editData.cardNumber || !/^[0-9]{16}$/.test(editData.cardNumber.replace(/\s/g, ''))) {
            errors.cardNumber = "Номер карты должен содержать ровно 16 цифр";
            isValid = false;
        }

        if (!editData.cardDate || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(editData.cardDate)) {
            errors.cardDate = "Укажите срок действия в формате ММ/ГГ (например, 05/25)";
            isValid = false;
        } else {
            const [month, year] = editData.cardDate.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;

            if (parseInt(year) < currentYear ||
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                errors.cardDate = "Срок действия карты истек";
                isValid = false;
            }
        }

        if (!editData.bankId) {
            errors.bankId = "Выберите банк";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'cardNumber') {
            const cleanedValue = value.replace(/\s/g, '').replace(/\D/g, '');
            const formattedValue = cleanedValue.match(/.{1,4}/g)?.join(' ') || cleanedValue;
            setEditData(prev => ({ ...prev, [name]: formattedValue }));
        }

        else if (name === 'cardDate') {
            let cleanedValue = value.replace(/\D/g, '');
            if (cleanedValue.length > 2) {
                cleanedValue = cleanedValue.substring(0, 2) + '/' + cleanedValue.substring(2, 4);
            }
            setEditData(prev => ({ ...prev, [name]: cleanedValue }));
        }
        else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }

        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSaveData = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const cardNumberWithoutSpaces = editData.cardNumber.replace(/\s/g, '');

            await axios.patch(
                `http://localhost:5221/api/cards/${cardId}`,
                {
                    cardNumber: cardNumberWithoutSpaces,
                    cardDate: editData.cardDate,
                    bankId: editData.bankId,
                }
            );
            setSuccess(true);
            setTimeout(() => navigate(`/guest-profile`), 1500);
        } catch (err) {
            console.error("Ошибка при обновлении данных карты:", err);
            setError(err.response?.data?.message || "Ошибка при обновлении данных карты");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка данных карты...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="error-message">
                <FaExclamationTriangle /> {error}
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Редактирование карты</h1>

            <div className="card-form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> Данные карты успешно обновлены!
                    </div>
                )}

                <form onSubmit={handleSaveData}>
                    <div className="form-group">
                        <label>
                            <FaCreditCard /> Номер карты
                        </label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={editData.cardNumber}
                            onChange={handleChange}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                        />
                        {validationErrors.cardNumber && (
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
                            value={editData.cardDate}
                            onChange={handleChange}
                            placeholder="ММ/ГГ"
                            maxLength={5}
                        />
                        {validationErrors.cardDate && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.cardDate}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FaPiggyBank /> Банк
                        </label>
                        <select
                            name="bankId"
                            value={editData.bankId}
                            onChange={handleChange}
                        >
                            <option value="">Выберите банк</option>
                            {banks.map((bank) => (
                                <option key={bank.id} value={bank.id}>
                                    {bank.name}
                                </option>
                            ))}
                        </select>
                        {validationErrors.bankId && (
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
                            {loading ? <FaSpinner className="spinner" /> : "Сохранить изменения"}
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
                .form-group select {
                    width: 90%;
                    box-sizing: border-box;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: black;
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

export default EditCard;