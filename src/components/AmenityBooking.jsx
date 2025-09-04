import {useNavigate, useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaInfoCircle, FaExclamationTriangle, FaMoneyBillWave } from "react-icons/fa";

const AmenityBooking = () => {
    const { amenityId, bookingId } = useParams();
    const [guestId, setGuestId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        quantity: 1
    });
    const [amenity, setAmenity] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Пользователь не авторизован");
                    setLoading(false);
                    return;
                }

                const decoded = jwtDecode(token);
                const guestResponse = await axios.get(`http://localhost:5221/api/guests/${decoded.client_id}`);
                setGuestId(guestResponse.data.id);

                const amenityResponse = await axios.get(`http://localhost:5221/api/amenities/${amenityId}`);
                setAmenity(amenityResponse.data);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError(err.response?.data?.message || "Произошла ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [amenityId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!guestId) {
            setError("Не удалось идентифицировать гостя");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amenityId: amenityId,
                guestId: guestId,
                roomBookingId: bookingId,
                quantity: parseInt(form.quantity, 10)
            };

            await axios.post('http://localhost:5221/api/amenity-bookings', payload);
/*            alert("Услуга успешно заказана!");*/
            navigate(`/myamenitys/${bookingId}`);
        } catch (err) {
            console.error("Ошибка при заказе услуги:", err);
            setError(err.response?.data?.message || "Произошла ошибка при заказе услуги");
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

    if (!amenity) return (
        <div className="container">
            <Navbar />
            <div className="error-message">
                <FaExclamationTriangle /> Услуга не найдена
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Бронирование услуги: {amenity.name}</h1>


            <div className="booking-form-card">
                <p className="info-note">
                    После оформления ждите, когда сотрудник возьмется за услугу
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Количество</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : "Заказать услугу"}
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

                .amenity-info-card,
                .booking-form-card {
                    background: white;
                    border-radius: 10px;
                    width: 600px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin-bottom: 25px;
                    border-left: 4px solid #2980b9;
                    border-top: 1px solid #e0e0e0;
                    border-right: 1px solid #e0e0e0;
                    border-bottom: 1px solid #e0e0e0;
                }

                .amenity-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .amenity-header h2 {
                    font-size: 1.4rem;
                    color: #2c3e50;
                    margin: 0;
                }

                .amenity-price {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #27ae60;
                }

                .amenity-details {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .detail-item {
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                }

                .icon-wrapper {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7f8c8d;
                    margin-top: 3px;
                }

                .detail-label {
                    font-size: 0.9rem;
                    color: #7f8c8d;
                    margin: 0 0 2px 0;
                }

                .detail-value {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #2d3436;
                    margin: 0;
                }

                .info-note {
                    background-color: #e3f2fd;
                    padding: 12px;
                    border-radius: 6px;
                    color: #1976d2;
                    margin-top: 0;
                    margin-bottom: 25px;
                    text-align: center;
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

                .form-group input {
                    width: 500px;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    transition: border 0.2s;
                    background-color: white;
                    color: black;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
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
                    .amenity-details {
                        grid-template-columns: 1fr;
                    }

                    .form-actions {
                        justify-content: center;
                    }

                    .btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .amenity-info-card,
                    .booking-form-card {
                        width: auto;
                    }

                    .form-group input {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AmenityBooking;