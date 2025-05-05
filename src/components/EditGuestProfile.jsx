import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaUserEdit, FaExclamationTriangle, FaCheck, FaSave } from "react-icons/fa";

const EditGuestProfile = () => {
    const [userData, setUserData] = useState(null);
    const [guestData, setGuestData] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        patronymic: '',
        surname: '',
        email: '',
        phoneNumber: '',
        cityOfResidence: '',
        dateOfBirth: '',
        passportSeriesHash: '',
        passportNumberHash: '',
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({
        name: false,
        surname: false,
        email: false,
        phoneNumber: false,
        cityOfResidence: false,
        dateOfBirth: false,
        passportSeriesHash: false,
        passportNumberHash: false,
    });
    const navigate = useNavigate();

    // Валидация полей
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
            case 'surname':
            case 'patronymic':
            case 'cityOfResidence':
                if (!value) {
                    error = 'Обязательное поле';
                } else if (!/^[A-Za-zА-Яа-я\s-]+$/.test(value)) {
                    error = 'Допустимы только буквы и дефис';
                } else if (value.length > 50) {
                    error = 'Максимум 50 символов';
                }
                break;

            case 'email':
                if (!value) {
                    error = 'Обязательное поле';
                } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
                    error = 'Некорректный email';
                } else if (value.length > 100) {
                    error = 'Максимум 100 символов';
                }
                break;

            case 'phoneNumber':
                if (!value) {
                    error = 'Обязательное поле';
                } else if (!/^\+[0-9]{11}$/.test(value)) {
                    error = 'Формат: +79221234567';
                }
                break;

            case 'passportSeriesHash':
                if (!value) {
                    error = 'Обязательное поле';
                } else if (value.length !== 4) {
                    error = 'Серия паспорта должна содержать 4 цифры';
                } else if (!/^\d+$/.test(value)) {
                    error = 'Допустимы только цифры';
                }
                break;

            case 'passportNumberHash':
                if (!value) {
                    error = 'Обязательное поле';
                } else if (value.length !== 6) {
                    error = 'Номер паспорта должен содержать 6 цифр';
                } else if (!/^\d+$/.test(value)) {
                    error = 'Допустимы только цифры';
                }
                break;

            case 'dateOfBirth':
                if (!value) {
                    error = 'Обязательное поле';
                } else {
                    const birthDate = new Date(value);
                    const currentDate = new Date();

                    if (birthDate > currentDate) {
                        error = 'Дата не может быть в будущем';
                    } else {
                        const minAgeDate = new Date();
                        minAgeDate.setFullYear(currentDate.getFullYear() - 18);

                        if (birthDate > minAgeDate) {
                            error = 'Возраст должен быть не менее 18 лет';
                        }
                    }

                    const maxAgeDate = new Date();
                    maxAgeDate.setFullYear(currentDate.getFullYear() - 120);

                    if (birthDate < maxAgeDate) {
                        error = 'Пожалуйста, укажите реальную дату рождения';
                    }
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
            if (key !== 'patronymic') { // Отчество не обязательное
                const error = validateField(key, editData[key]);
                if (error) {
                    errors[key] = error;
                    isValid = false;
                }
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    useEffect(() => {
        const getUserDataFromToken = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const response = await axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`);

                    setUserData(response.data);
                    setGuestData(response.data.guest);

                    setEditData({
                        name: response.data.name || '',
                        patronymic: response.data.patronymic || '',
                        surname: response.data.surname || '',
                        email: response.data.email || '',
                        phoneNumber: response.data.phoneNumber || '',
                        cityOfResidence: response.data.guest?.cityOfResidence || '',
                        dateOfBirth: response.data.guest?.dateOfBirth ? formatDate(response.data.guest.dateOfBirth) : '',
                        passportSeriesHash: response.data.guest?.passportSeriesHash || '',
                        passportNumberHash: response.data.guest?.passportNumberHash || '',
                    });
                } catch (err) {
                    console.error("Ошибка при получении данных пользователя:", err);
                    setError(err.response?.data?.message || "Ошибка загрузки данных");
                } finally {
                    setLoading(false);
                }
            } else {
                setError("Пользователь не авторизован");
                setLoading(false);
            }
        };

        getUserDataFromToken();
    }, []);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];  // Получаем только дату без времени
    };


    const handleSaveData = async (e) => {
        e.preventDefault();

        // Пометить все поля как "тронутые" для отображения ошибок
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
            const token = localStorage.getItem("token");
            const decodedToken = jwtDecode(token);

            await axios.patch(
                `http://localhost:5221/api/clients/${decodedToken.client_id}`,
                editData
            );

            setUserData({ ...userData, ...editData });
            setGuestData({ ...guestData, ...editData });
            setSuccess("Данные профиля успешно обновлены");
            setTimeout(() => navigate("/guest-profile"), 1500);
        } catch (err) {
            console.error("Ошибка при обновлении данных:", err);
            setError(err.response?.data?.message || "Ошибка при обновлении данных");
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
            <h1>Редактирование персональных данных</h1>

            <div className="profile-form-card">
                {success && (
                    <div className="success-message">
                        <FaCheck /> {success}
                    </div>
                )}

                <form onSubmit={handleSaveData}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Имя*</label>
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
                        <div className="form-group">
                            <label>Фамилия*</label>
                            <input
                                type="text"
                                name="surname"
                                value={editData.surname}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.surname && validationErrors.surname ? 'input-error' : ''}`}
                            />
                            {touched.surname && validationErrors.surname && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.surname}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Отчество</label>
                            <input
                                type="text"
                                name="patronymic"
                                value={editData.patronymic}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.patronymic && validationErrors.patronymic ? 'input-error' : ''}`}
                            />
                            {touched.patronymic && validationErrors.patronymic && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.patronymic}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={editData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.email && validationErrors.email ? 'input-error' : ''}`}
                            />
                            {touched.email && validationErrors.email && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.email}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Телефон*</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={editData.phoneNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.phoneNumber && validationErrors.phoneNumber ? 'input-error' : ''}`}
                            />
                            {touched.phoneNumber && validationErrors.phoneNumber && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.phoneNumber}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Город*</label>
                            <input
                                type="text"
                                name="cityOfResidence"
                                value={editData.cityOfResidence}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.cityOfResidence && validationErrors.cityOfResidence ? 'input-error' : ''}`}
                            />
                            {touched.cityOfResidence && validationErrors.cityOfResidence && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.cityOfResidence}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Дата рождения*</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={editData.dateOfBirth}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`form-input ${touched.dateOfBirth && validationErrors.dateOfBirth ? 'input-error' : ''}`}
                            />
                            {touched.dateOfBirth && validationErrors.dateOfBirth && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.dateOfBirth}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Серия паспорта*</label>
                            <input
                                type="text"
                                name="passportSeriesHash"
                                value={editData.passportSeriesHash}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={4}
                                className={`form-input ${touched.passportSeriesHash && validationErrors.passportSeriesHash ? 'input-error' : ''}`}
                            />
                            {touched.passportSeriesHash && validationErrors.passportSeriesHash && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.passportSeriesHash}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Номер паспорта*</label>
                            <input
                                type="text"
                                name="passportNumberHash"
                                value={editData.passportNumberHash}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                maxLength={6}
                                className={`form-input ${touched.passportNumberHash && validationErrors.passportNumberHash ? 'input-error' : ''}`}
                            />
                            {touched.passportNumberHash && validationErrors.passportNumberHash && (
                                <div className="validation-error">
                                    <FaExclamationTriangle /> {validationErrors.passportNumberHash}
                                </div>
                            )}
                        </div>
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

                .profile-form-card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    border-left: 4px solid #2980b9;
                    margin-top: 20px;
                }

                .form-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .form-group {
                    flex: 1;
                    min-width: 0;
                    margin: 10px;
                }

                .form-group label {
                    display: block;
                    font-weight: 500;
                    color: #2c3e50;
                    margin-bottom: 8px;
                    font-size: 0.9rem;
                }

                .form-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    background-color: white;
                    color: black;
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

                @media (max-width: 900px) {
                    .form-row {
                        flex-direction: column;
                        gap: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default EditGuestProfile;