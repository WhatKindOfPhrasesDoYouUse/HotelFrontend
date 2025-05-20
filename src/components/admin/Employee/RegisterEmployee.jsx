import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Navbar.jsx";
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RegisterEmployee = () => {
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        patronymic: "",
        email: "",
        phoneNumber: "",
        password: "",
        employeeTypeId: "",
    });

    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const isTokenValid = () => {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            return decoded.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        if (!isTokenValid()) {
            setError("Требуется авторизация");
            setLoading(false);
            navigate('/login');
            return;
        }

        const token = localStorage.getItem("token");

        axios.get('http://localhost:5221/api/employee-types', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                setEmployeeTypes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching employee types:', error);
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            });
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isTokenValid()) {
            setError("Сессия истекла. Пожалуйста, войдите снова.");
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        const token = localStorage.getItem("token");

        try {
            const dataToSend = {
                name: formData.name,
                surname: formData.surname,
                patronymic: formData.patronymic,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                passwordHash: formData.password,
                employeeTypeId: Number(formData.employeeTypeId),
                hotelId: 1,
                roles: ["employee", "Administrator"]
            };

            const response = await axios.post(
                'http://localhost:5221/api/auths/registration-employee',
                dataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                setSuccess("Сотрудник успешно зарегистрирован!");
                setTimeout(() => navigate('/employee-administration'), 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(
                error.response?.data?.title ||
                error.response?.data?.message ||
                error.message ||
                "Ошибка регистрации"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && employeeTypes.length === 0) {
        return (
            <div className="container">
                <Navbar />
                <div className="loading-spinner">
                    <FaSpinner className="spinner" /> Загрузка типов сотрудников...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <Navbar />
                <div className="error-message">
                    <FaExclamationTriangle /> {error}
                    <button
                        onClick={() => {
                            setError(null);
                            if (!isTokenValid()) navigate('/login');
                        }}
                        className="btn-retry"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />
            <h2>Регистрация нового сотрудника</h2>

            {success && <div className="success-message"><FaCheck /> {success}</div>}

            <form onSubmit={handleSubmit} className="form-card">
                <label>Фамилия</label>
                <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    required
                />

                <label>Имя</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />

                <label>Отчество</label>
                <input
                    type="text"
                    name="patronymic"
                    value={formData.patronymic}
                    onChange={handleInputChange}
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />

                <label>Телефон</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                />

                <label>Пароль</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />

                <label>Должность</label>
                <select
                    name="employeeTypeId"
                    value={formData.employeeTypeId}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                >
                    <option value="">Выберите должность</option>
                    {employeeTypes.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : <><FaSave /> Зарегистрировать</>}
                </button>
            </form>

            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .form-card {
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    border-left: 4px solid #2980b9;
                }
                .form-card label {
                    font-weight: 500;
                }
                .form-card input, .form-select {
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background-color: white;
                    color: black;
                }
                .form-select {
                    background-color: white;
                }
                .btn-primary {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 12px;
                    font-weight: bold;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    justify-content: center;
                }
                .btn-primary:disabled {
                    background-color: #95a5a6;
                    cursor: not-allowed;
                }
                .btn-retry {
                    margin-top: 10px;
                    padding: 8px 16px;
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .success-message, .error-message {
                    margin: 15px 0;
                    padding: 12px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                }
                .success-message {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                }
                .error-message {
                    background-color: #fdecea;
                    color: #e74c3c;
                }
                .loading-spinner {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    padding: 50px;
                    font-size: 1.2rem;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default RegisterEmployee;