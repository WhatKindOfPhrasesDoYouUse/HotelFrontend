import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner, FaHotel, FaInfoCircle, FaExclamationTriangle, FaCheck, FaSave } from "react-icons/fa";
import Navbar from "../../Navbar.jsx";

const EditBank = () => {
    const { bankId } = useParams();
    const navigate = useNavigate();
    const [bank, setBank] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({
        name: false,
    });

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value) {
                    error = 'Название обязательно';
                } else if (!/^[A-Za-zА-Яа-я\-]+$/.test(value)) {
                    error = 'Допустимы только буквы и дефис';
                } else if (value.length < 3) {
                    error = 'Минимум 3 символа';
                } else if (value.length > 50) {
                    error = 'Максимум 50 символов';
                }
                break;
        }

        return error;
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, editData[name]);
        setValidationErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            const error = validateField(name, value);
            setValidationErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        Object.keys(editData).forEach(key => {
            const error = validateField(key, editData[key]);
            if (error) {
                errors[key] = error;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    useEffect(() => {
        const fetchBanks = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5221/api/banks/${bankId}`, {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }});
                setBank(response.data);
                setEditData({
                    name: response.data.name,
                    description: response.data.description
                });
            } catch (err) {
                console.error("Ошибка при загрузке типа отеля:", err);
                setError(err.response?.data?.message || "Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        };

        fetchBanks();
    }, [bankId]);

    const handleSave = async (e) => {
        e.preventDefault();

        const newTouched = {};
        Object.keys(touched).forEach(key => {
            newTouched[key] = true;
        });
        setTouched(newTouched);

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.patch(
                `http://localhost:5221/api/banks/${bankId}`, editData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

            setSuccess("Тип отеля успешно обновлен");
            setTimeout(() => navigate("/bank-administration"), 1500);
        } catch (err) {
            console.error("Ошибка при обновлении типа отеля:", err);
            setError(err.response?.data?.message || "Ошибка при обновлении");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !bank) return (
        <div className="container">
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка данных...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-message">
                <FaExclamationTriangle /> {error}
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar/>
            <h1>Редактирование типа отеля</h1>

            <div className="form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> {success}
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>
                            <FaHotel /> Название типа*
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={editData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`form-input ${touched.name && validationErrors.name ? 'input-error' : ''}`}
                        />
                        {touched.name && validationErrors.name && (
                            <div className="validation-error">
                                <FaExclamationTriangle /> {validationErrors.name}
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : <><FaSave /> Сохранить</>}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .container {
                    max-width: 1200px;
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

                .form-card {
                    width: 600px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
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

                .form-input.input-error {
                    border-color: #e74c3c;
                    background-color: #fff9f9;
                }

                textarea.form-input {
                    min-height: 100px;
                    resize: vertical;
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

                @media (max-width: 600px) {
                    .container {
                        padding: 15px;
                    }
                    
                    .form-card {
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default EditBank;