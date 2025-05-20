import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSave } from "react-icons/fa";
import Navbar from "../../Navbar.jsx";

const EditEmployee = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    const [formData, setFormData] = useState({
        client: {
            name: '',
            surname: '',
            patronymic: '',
            email: '',
            phoneNumber: '',
            passwordHash: ''
        },
        employeeTypeId: 0,
        hotelId: 0,
        clientId: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const [employeeTypesResponse, employeeResponse] = await Promise.all([
                    axios.get('http://localhost:5221/api/employee-types'),
                    axios.get(`http://localhost:5221/api/employees/${employeeId}`)
                ]);

                setEmployeeTypes(employeeTypesResponse.data);
                const data = employeeResponse.data;

                setEmployeeData(data);
                setFormData({
                    client: {
                        name: data.client.name,
                        surname: data.client.surname,
                        patronymic: data.client.patronymic,
                        email: data.client.email,
                        phoneNumber: data.client.phoneNumber,
                        passwordHash: data.client.passwordHash
                    },
                    employeeTypeId: data.employeeTypeId,
                    hotelId: data.hotelId,
                    clientId: data.clientId
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки данных сотрудника');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [employeeId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            client: {
                ...prev.client,
                [name]: value
            }
        }));
    };

    const handleEmployeeTypeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            employeeTypeId: parseInt(e.target.value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await axios.patch(`http://localhost:5221/api/employees/${employeeId}`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSuccess("Данные сотрудника успешно обновлены");
            setTimeout(() => navigate("/employee-administration"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при обновлении данных');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner"><FaSpinner className="spinner" /> Загрузка...</div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="error-message"><FaExclamationTriangle /> {error}</div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h2>Редактирование данных сотрудника</h2>

            {success && <div className="success-message"><FaCheck /> {success}</div>}

            <form onSubmit={handleSubmit} className="form-card">
                <label>Имя*</label>
                <input
                    type="text"
                    name="name"
                    value={formData.client.name}
                    onChange={handleChange}
                    required
                />

                <label>Фамилия*</label>
                <input
                    type="text"
                    name="surname"
                    value={formData.client.surname}
                    onChange={handleChange}
                    required
                />

                <label>Отчество*</label>
                <input
                    type="text"
                    name="patronymic"
                    value={formData.client.patronymic}
                    onChange={handleChange}
                />

                <label>Email*</label>
                <input
                    type="email"
                    name="email"
                    value={formData.client.email}
                    onChange={handleChange}
                    required
                />

                <label>Телефон*</label>
                <input
                    type="text"
                    name="phoneNumber"
                    value={formData.client.phoneNumber}
                    onChange={handleChange}
                    required
                />

                <label>Тип сотрудника*</label>
                <select
                    value={formData.employeeTypeId}
                    onChange={handleEmployeeTypeChange}
                    className="form-select"
                    required
                >
                    <option value="">Выберите тип сотрудника</option>
                    {employeeTypes.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>

                <input
                    type="hidden"
                    name="passwordHash"
                    value={formData.client.passwordHash}
                />

                <input
                    type="hidden"
                    name="hotelId"
                    value={formData.hotelId}
                />

                <input
                    type="hidden"
                    name="clientId"
                    value={formData.clientId}
                />

                <button type="submit" className="btn-primary">
                    {loading ? <FaSpinner className="spinner" /> : <><FaSave /> Сохранить</>}
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

export default EditEmployee;