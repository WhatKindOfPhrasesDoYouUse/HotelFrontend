import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaLock, FaUser, FaPhone, FaCity, FaBirthdayCake, FaPassport, FaSignInAlt, FaSpinner } from "react-icons/fa";

function GuestRegistration() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [passwordHash, setPasswordHash] = useState("");
    const [cityOfResidence, setCityOfResidence] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [passportSeriesHash, setPassportSeriesHash] = useState("");
    const [passportNumberHash, setPassportNumberHash] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        let errors = {};

        if (!name) errors.name = "Имя обязательно";
        if (!surname) errors.surname = "Фамилия обязательна";
        if (!email) errors.email = "Email обязателен";
        if (!phoneNumber) errors.phoneNumber = "Номер телефона обязателен";
        if (!passwordHash) errors.passwordHash = "Пароль обязателен";
        if (!cityOfResidence) errors.cityOfResidence = "Город проживания обязателен";
        if (!dateOfBirth) errors.dateOfBirth = "Дата рождения обязательна";
        if (!passportSeriesHash) errors.passportSeriesHash = "Серия паспорта обязательна";
        if (!passportNumberHash) errors.passportNumberHash = "Номер паспорта обязателен";

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (email && !emailPattern.test(email)) {
            errors.email = "Неверный формат email";
        }

        const phonePattern = /^\+?\d{10,12}$/;
        if (phoneNumber && !phonePattern.test(phoneNumber)) {
            errors.phoneNumber = "Неверный формат номера телефона";
        }

        const passportSeriesHashPattern = /^\d{4}$/;
        if (passportSeriesHash && !passportSeriesHashPattern.test(passportSeriesHash)) {
            errors.passportSeriesHash = "Серия паспорта должна содержать 4 цифры";
        }

        const passportNumberHashPattern = /^\d{6}$/;
        if (passportNumberHash && !passportNumberHashPattern.test(passportNumberHash)) {
            errors.passportNumberHash = "Номер паспорта должен содержать 6 цифр";
        }

        const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
        if (dateOfBirth && !datePattern.test(dateOfBirth)) {
            errors.dateOfBirth = "Неверный формат даты (должен быть ДД.ММ.ГГГГ)";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const formatDateToISO = (dateString) => {
        const parts = dateString.split('.');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const handleRegistration = async (e) => {
        e.preventDefault();

        const isValid = validate();
        if (!isValid) return;

        try {
            setError("");
            setLoading(true);

            const formattedDateOfBirth = formatDateToISO(dateOfBirth);

            const response = await axios.post("http://localhost:5221/api/auths/registration", {
                name,
                surname,
                patronymic,
                email,
                phoneNumber,
                passwordHash,
                cityOfResidence,
                dateOfBirth: formattedDateOfBirth,
                passportSeriesHash,
                passportNumberHash
            });

            if (response.status === 200) {
                navigate("/login");
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || "Ошибка регистрации");
            } else {
                setError("Ошибка подключения к серверу");
            }
            console.error("Ошибка при регистрации:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <div className="auth-logo">
                    <FaUser />
                </div>
                <h1>Регистрация гостя</h1>
                <p>Создайте аккаунт, чтобы получить доступ ко всем возможностям</p>
            </div>

            <div className="auth-content">
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleRegistration}>
                    <div className="form-group">
                        <label htmlFor="surname">Фамилия</label>
                        <div className="input-with-icon">
                            <FaUser />
                            <input
                                type="text"
                                id="surname"
                                className={`form-control ${validationErrors.surname ? 'is-invalid' : ''}`}
                                placeholder="Иванов"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.surname && <div className="invalid-feedback">{validationErrors.surname}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Имя</label>
                        <div className="input-with-icon">
                            <FaUser />
                            <input
                                type="text"
                                id="name"
                                className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                                placeholder="Иван"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="patronymic">Отчество</label>
                        <div className="input-with-icon">
                            <FaUser />
                            <input
                                type="text"
                                id="patronymic"
                                className="form-control"
                                placeholder="Иванович"
                                value={patronymic}
                                onChange={(e) => setPatronymic(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Электронная почта</label>
                        <div className="input-with-icon">
                            <FaEnvelope />
                            <input
                                type="email"
                                id="email"
                                className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                                placeholder="example@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.email && <div className="invalid-feedback">{validationErrors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Номер телефона</label>
                        <div className="input-with-icon">
                            <FaPhone />
                            <input
                                type="text"
                                id="phoneNumber"
                                className={`form-control ${validationErrors.phoneNumber ? 'is-invalid' : ''}`}
                                placeholder="+79991234567"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.phoneNumber && <div className="invalid-feedback">{validationErrors.phoneNumber}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="passwordHash">Пароль</label>
                        <div className="input-with-icon">
                            <FaLock />
                            <input
                                type="password"
                                id="passwordHash"
                                className={`form-control ${validationErrors.passwordHash ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                value={passwordHash}
                                onChange={(e) => setPasswordHash(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.passwordHash && <div className="invalid-feedback">{validationErrors.passwordHash}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cityOfResidence">Город проживания</label>
                        <div className="input-with-icon">
                            <FaCity />
                            <input
                                type="text"
                                id="cityOfResidence"
                                className={`form-control ${validationErrors.cityOfResidence ? 'is-invalid' : ''}`}
                                placeholder="Москва"
                                value={cityOfResidence}
                                onChange={(e) => setCityOfResidence(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.cityOfResidence && <div className="invalid-feedback">{validationErrors.cityOfResidence}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="dateOfBirth">Дата рождения</label>
                        <div className="input-with-icon">
                            <FaBirthdayCake />
                            <input
                                type="text"
                                id="dateOfBirth"
                                className={`form-control ${validationErrors.dateOfBirth ? 'is-invalid' : ''}`}
                                placeholder="ДД.ММ.ГГГГ"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.dateOfBirth && <div className="invalid-feedback">{validationErrors.dateOfBirth}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="passportSeriesHash">Серия паспорта</label>
                        <div className="input-with-icon">
                            <FaPassport />
                            <input
                                type="text"
                                id="passportSeriesHash"
                                className={`form-control ${validationErrors.passportSeriesHash ? 'is-invalid' : ''}`}
                                placeholder="1234"
                                value={passportSeriesHash}
                                onChange={(e) => setPassportSeriesHash(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.passportSeriesHash && <div className="invalid-feedback">{validationErrors.passportSeriesHash}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="passportNumberHash">Номер паспорта</label>
                        <div className="input-with-icon">
                            <FaPassport />
                            <input
                                type="text"
                                id="passportNumberHash"
                                className={`form-control ${validationErrors.passportNumberHash ? 'is-invalid' : ''}`}
                                placeholder="123456"
                                value={passportNumberHash}
                                onChange={(e) => setPassportNumberHash(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {validationErrors.passportNumberHash && <div className="invalid-feedback">{validationErrors.passportNumberHash}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <FaSpinner className="spinner" />
                                Регистрация...
                            </>
                        ) : (
                            <>
                                <FaUser />
                                Зарегистрироваться
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="auth-footer">
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </div>

            <style jsx>{`
                .auth-container {
                    width: 100%;
                    max-width: 500px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin: 20px auto;
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
                    background-color: white;
                    color: black;
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
                
                @media (max-width: 600px) {
                    .auth-container {
                        margin: 10px;
                        max-width: 100%;
                    }
                
                    .auth-header {
                        padding: 20px;
                    }
                
                    .auth-content {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}

export default GuestRegistration;