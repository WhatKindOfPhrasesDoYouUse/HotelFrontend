import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaSpinner, FaMoneyBillWave, FaInfoCircle, FaPlusCircle } from "react-icons/fa";

const AmenityList = () => {
    const { bookingId } = useParams();
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5221/api/amenities/${bookingId}/room-booking`)
            .then((response) => {
                setAmenities(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(`Ошибка при получении данных дополнительных услуг: ${err.message}`);
                setLoading(false);
            });
    }, [bookingId]);

    if (loading) return (
        <div className="container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка дополнительных услуг...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="container">
            <Navbar />
            <div className="error-message">
                <p style={{ color: "red" }}>Ошибка: {error}</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <Navbar />
            <h1>Дополнительные услуги для бронирования #{bookingId}</h1>

            {amenities.length === 0 ? (
                <div className="no-amenities">
                    <FaInfoCircle size={50} />
                    <p>Нет доступных дополнительных услуг</p>
                </div>
            ) : (
                <div className="amenities-grid">
                    {amenities.map(amenity => (
                        <div key={amenity.id} className="amenity-card">
                            <div className="amenity-header">
                                <h3>{amenity.name}</h3>
                            </div>

                            <div className="amenity-details">
                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaInfoCircle />
                                    </div>
                                    <div>
                                        <p className="detail-value">
                                            {amenity.description || 'Описание отсутствует'}
                                        </p>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="icon-wrapper">
                                        <FaMoneyBillWave />
                                    </div>
                                    <div>
                                        <p className="detail-value">
                                            {amenity.unitPrice} ₽
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="amenity-actions">
                                <Link
                                    to={`/amenity-booking/${amenity.id}/${bookingId}`}
                                    className="btn btn-primary"
                                >
                                    <FaPlusCircle /> Заказать
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

                .no-amenities {
                    text-align: center;
                    padding: 40px 20px;
                    background-color: #f8f9fa;
                    border-radius: 10px;
                    margin-top: 20px;
                }

                .no-amenities p {
                    margin: 15px 0;
                    color: #6c757d;
                }

                .amenities-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-top: 20px;
                }

                .amenity-card {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 20px;
                    border-left: 4px solid #3498db;
                    transition: transform 0.2s ease;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                }

                .amenity-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .amenity-header {
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }

                .amenity-header h3 {
                    font-size: 1.2rem;
                    color: #2c3e50;
                    margin: 0;
                }

                .amenity-details {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                    flex-grow: 1;
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

                .detail-value {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #2d3436;
                    margin: 0;
                }

                .amenity-actions {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .btn-primary {
                    background-color: #3498db;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2980b9;
                }

                .error-message {
                    background-color: #fdecea;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: center;
                }

                @media (max-width: 1200px) {
                    .amenities-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 900px) {
                    .amenities-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .amenities-grid {
                        grid-template-columns: 1fr;
                    }

                    .amenity-card {
                        min-height: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default AmenityList;