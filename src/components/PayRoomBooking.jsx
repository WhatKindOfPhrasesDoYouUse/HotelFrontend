import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from "./Navbar.jsx";
import { FaCreditCard, FaLock, FaCheck } from 'react-icons/fa';
import { SiVisa, SiMastercard } from 'react-icons/si';

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('saved-card');
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                const response = await axios.get(`http://localhost:5221/api/room-payments/${bookingId}`);
                setBookingData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingData();
    }, [bookingId]);

    const handlePaymentSubmit = () => {
        console.log('Оплата проведена', {
            bookingId,
            paymentMethod: selectedPaymentMethod,
            amount: bookingData.totalAmount,
            cardData: selectedPaymentMethod === 'new-card' ? cardData : null
        });
        navigate('/payment-success');
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        setCardData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    const calculateNights = () => {
        if (!bookingData?.roomBooking?.checkInDate || !bookingData?.roomBooking?.checkOutDate) return 0;
        const checkIn = new Date(bookingData.roomBooking.checkInDate);
        const checkOut = new Date(bookingData.roomBooking.checkOutDate);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    if (loading) return <div className="loading">Загрузка данных...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!bookingData) return <div className="error">Данные бронирования не найдены</div>;

    return (
        <div className="payment-container">
            <Navbar />
            <div className="payment-card">
                <div className="payment-header">
                    <FaCreditCard className="payment-icon" />
                    <h1>Оплата бронирования</h1>
                    <p>Выберите способ оплаты для завершения бронирования</p>
                </div>

                <div className="booking-section">
                    <h2>Детали бронирования</h2>
                    <div className="details-grid">
                        <div className="detail">
                            <span className="detail-label">Отель:</span>
                            <span className="detail-value">{bookingData.hotelName}</span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Номер:</span>
                            <span className="detail-value">№{bookingData.numberRoom}</span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Даты:</span>
                            <span className="detail-value">
                                {formatDate(bookingData.roomBooking.checkInDate)} - {formatDate(bookingData.roomBooking.checkOutDate)} ({calculateNights()} ночей)
                            </span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Гости:</span>
                            <span className="detail-value">{bookingData.roomBooking.numberOfGuests} человек</span>
                        </div>
                    </div>
                </div>

                <div className="total-section">
                    <span>Итого к оплате:</span>
                    <span className="total-amount">{bookingData.totalAmount.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="payment-methods">
                    <h2>Способ оплаты</h2>

                    <div className="payment-options">
                        {bookingData.card && (
                            <div
                                className={`payment-option ${selectedPaymentMethod === 'saved-card' ? 'selected' : ''}`}
                                onClick={() => setSelectedPaymentMethod('saved-card')}
                            >
                                <div className="radio-container">
                                    {selectedPaymentMethod === 'saved-card' && <FaCheck className="radio-check" />}
                                </div>
                                <div className="card-info">
                                    <div className="card-brand">
                                        {bookingData.card.cardNumber.startsWith('4') ? (
                                            <SiVisa className="card-icon visa" />
                                        ) : (
                                            <SiMastercard className="card-icon mastercard" />
                                        )}
                                        <span className="card-number">•••• •••• •••• {bookingData.card.cardNumber.slice(-4)}</span>
                                    </div>
                                    <div className="card-expiry">Срок: {bookingData.card.cardDate}</div>
                                </div>
                            </div>
                        )}

                        <div
                            className={`payment-option ${selectedPaymentMethod === 'new-card' ? 'selected' : ''}`}
                            onClick={() => setSelectedPaymentMethod('new-card')}
                        >
                            <div className="radio-container">
                                {selectedPaymentMethod === 'new-card' && <FaCheck className="radio-check" />}
                            </div>
                            <div className="card-info">
                                <FaCreditCard className="card-icon new-card" />
                                <span className="new-card-text">Новая карта</span>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedPaymentMethod === 'new-card' && (
                    <div className="new-card-form">
                        <div className="form-group">
                            <label>Номер карты</label>
                            <input
                                type="text"
                                name="number"
                                value={cardData.number}
                                onChange={handleCardInputChange}
                                placeholder="1234 5678 9012 3456"
                            />
                        </div>
                        <div className="form-group">
                            <label>Имя владельца</label>
                            <input
                                type="text"
                                name="name"
                                value={cardData.name}
                                onChange={handleCardInputChange}
                                placeholder="IVAN IVANOV"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Срок действия</label>
                                <input
                                    type="text"
                                    name="expiry"
                                    value={cardData.expiry}
                                    onChange={handleCardInputChange}
                                    placeholder="MM/ГГ"
                                />
                            </div>
                            <div className="form-group">
                                <label>CVV/CVC</label>
                                <input
                                    type="text"
                                    name="cvv"
                                    value={cardData.cvv}
                                    onChange={handleCardInputChange}
                                    placeholder="123"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    className="pay-button"
                    onClick={handlePaymentSubmit}
                    disabled={selectedPaymentMethod === 'new-card' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)}
                >
                    <FaLock className="lock-icon" />
                    Оплатить {bookingData.totalAmount.toLocaleString('ru-RU')} ₽
                </button>

                <div className="agreement">
                    Нажимая кнопку, вы соглашаетесь с <a href="#">условиями оплаты</a>
                </div>
            </div>

            <style jsx>{`
                .payment-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                    font-family: 'Arial', sans-serif;
                }
                
                .payment-card {
                    width: 100%;
                    max-width: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .payment-header {
                    padding: 25px;
                    text-align: center;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .payment-header h1 {
                    font-size: 24px;
                    margin: 10px 0 5px;
                    color: #2d3748;
                }
                
                .payment-header p {
                    color: #718096;
                    font-size: 14px;
                    margin: 0;
                }
                
                .payment-icon {
                    font-size: 28px;
                    color: #4a6bff;
                }
                
                .booking-section,
                .payment-methods {
                    padding: 20px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                h2 {
                    font-size: 18px;
                    margin: 0 0 15px;
                    color: #2d3748;
                }
                
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                
                .detail {
                    display: flex;
                    justify-content: space-between;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #4a5568;
                }
                
                .detail-value {
                    color: #2d3748;
                }
                
                .total-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background-color: #f8fafc;
                    font-weight: 600;
                }
                
                .total-amount {
                    font-size: 18px;
                    font-weight: 700;
                    color: #2d3748;
                }
                
                .payment-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .payment-option {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .payment-option.selected {
                    border-color: #4a6bff;
                    background-color: rgba(74, 107, 255, 0.05);
                }
                
                .radio-container {
                    width: 20px;
                    height: 20px;
                    border: 1px solid #e2e8f0;
                    border-radius: 50%;
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .radio-check {
                    color: #4a6bff;
                    font-size: 12px;
                }
                
                .card-info {
                    flex: 1;
                }
                
                .card-brand {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                
                .card-icon {
                    font-size: 24px;
                    margin-right: 10px;
                }
                
                .visa {
                    color: #1a1f71;
                }
                
                .mastercard {
                    color: #eb001b;
                }
                
                .new-card {
                    color: #4a5568;
                }
                
                .card-number {
                    font-weight: 500;
                }
                
                .card-expiry {
                    font-size: 14px;
                    color: #718096;
                    margin-left: 34px;
                }
                
                .new-card-text {
                    margin-left: 10px;
                    font-weight: 500;
                }
                
                .new-card-form {
                    padding: 15px;
                    margin-top: 10px;
                    background-color: #f8fafc;
                    border-radius: 8px;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #4a5568;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 16px;
                }
                
                .form-row {
                    display: flex;
                    gap: 15px;
                }
                
                .form-row .form-group {
                    flex: 1;
                }
                
                .pay-button {
                    width: calc(100% - 40px);
                    margin: 20px;
                    padding: 15px;
                    background-color: #4a6bff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .pay-button:hover {
                    background-color: #3a5bef;
                }
                
                .pay-button:disabled {
                    background-color: #a0aec0;
                    cursor: not-allowed;
                }
                
                .lock-icon {
                    font-size: 16px;
                }
                
                .agreement {
                    text-align: center;
                    padding: 0 20px 20px;
                    font-size: 14px;
                    color: #718096;
                }
                
                .agreement a {
                    color: #4a6bff;
                    text-decoration: none;
                }
                
                .agreement a:hover {
                    text-decoration: underline;
                }
                
                .loading, .error {
                    text-align: center;
                    padding: 50px;
                    font-size: 16px;
                }
                
                .error {
                    color: #e53e3e;
                }
            `}</style>
        </div>
    );
};

export default PaymentPage;