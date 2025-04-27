import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar.jsx";
import { FaSpinner } from "react-icons/fa";
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
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Проверка валидности токена
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
                roles: ["employee", "Administrator"] // Передаем обе роли
            };

            console.log('Sending data:', dataToSend); // Для отладки

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
                setSuccess(true);
                setTimeout(() => navigate('/admin-panel'), 2000);
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
                    <FaSpinner className="spinner" />
                    <p>Загрузка типов сотрудников...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <Navbar />
                <div className="error-message">
                    <p style={{ color: "red" }}>Ошибка: {error}</p>
                    <button onClick={() => {
                        setError(null);
                        if (!isTokenValid()) navigate('/login');
                    }}>
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container">
                <Navbar />
                <div style={{ color: "green" }}>
                    <p>Сотрудник успешно зарегистрирован!</p>
                    <p>Перенаправление на панель администратора...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <Navbar />
            <h2>Регистрация нового сотрудника</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Фамилия:</label>
                    <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Имя:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Отчество:</label>
                    <input
                        type="text"
                        name="patronymic"
                        value={formData.patronymic}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Телефон:</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Пароль:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Должность:</label>
                    <select
                        name="employeeTypeId"
                        value={formData.employeeTypeId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Выберите должность</option>
                        {employeeTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="submit-button"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="spinner" />
                            Обработка...
                        </>
                    ) : "Зарегистрировать"}
                </button>
            </form>
        </div>
    );
};

export default RegisterEmployee;