import React from "react"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FaStar, FaComment, FaPaperPlane, FaHome } from "react-icons/fa";
import Navbar from "./Navbar.jsx";

const WriteHotelReview = () => {
    const { bookingId } = useParams();
    const [reviewData, setReviewData] = useState({
        comment: "",
        rating: 0
    });
    const [hoverRating, setHoverRating] = useState(0);
    const [guestData, setGuestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Пользователь не авторизован");
            setLoading(false);
            return;
        }

        const decodedToken = jwtDecode(token);
        axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/guest`)
            .then((response) => {
                setGuestData(response.data.guest);
            })
            .catch((err) => {
                setError("Ошибка загрузки данных");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleRatingChange = (rating) => {
        setReviewData(prev => ({
            ...prev,
            rating: rating
        }));
    };

    const handleCommentChange = (e) => {
        setReviewData(prev => ({
            ...prev,
            comment: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!guestData?.id) {
            setError("ID гостя не найден");
            setSubmitting(false);
            return;
        }

        if (!bookingId) {
            setError("ID бронирования не найдено");
            setSubmitting(false);
            return;
        }

        if (!reviewData.rating || reviewData.rating === 0) {
            setError("Пожалуйста, поставьте оценку");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...reviewData,
                guestId: guestData.id,
                roomBookingId: parseInt(bookingId),
                hotelId: 1
            };

            await axios.post('http://localhost:5221/api/hotel-reviews', payload);
            setSuccess(true);
            setTimeout(() => navigate(`/hotels/${1}/reviews`), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Не удалось сохранить отзыв");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="auth-container" style={{
                    width: '100%',
                    maxWidth: '450px',
                    background: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    margin: '20px'
                }}>
                    <div className="auth-header" style={{
                        background: 'linear-gradient(135deg, #4a6bff, #3a5bef)',
                        color: 'white',
                        padding: '30px',
                        textAlign: 'center'
                    }}>
                        <div className="auth-logo" style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4a6bff',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            <FaStar />
                        </div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Оставить отзыв</h1>
                        <p style={{ opacity: '0.9', fontSize: '0.95rem' }}>Поделитесь своим мнением о нашем сервисе</p>
                    </div>
                    <div className="auth-content" style={{
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <FaStar className="fa-spin" style={{ fontSize: '30px', color: '#4a6bff' }} />
                        <p>Загрузка...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="auth-container" style={{
                    width: '100%',
                    maxWidth: '450px',
                    background: 'white',
                    borderRadius: '15px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    margin: '20px'
                }}>
                    <div className="auth-header" style={{
                        background: 'linear-gradient(135deg, #4a6bff, #3a5bef)',
                        color: 'white',
                        padding: '30px',
                        textAlign: 'center'
                    }}>
                        <div className="auth-logo" style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 20px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4a6bff',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                        }}>
                            <FaStar />
                        </div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Оставить отзыв</h1>
                        <p style={{ opacity: '0.9', fontSize: '0.95rem' }}>Поделитесь своим мнением о нашем сервисе</p>
                    </div>
                    <div className="auth-content" style={{ padding: '30px' }}>
                        <div className="auth-error" style={{
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            padding: '10px 15px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            border: '1px solid #f5c6cb',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                backgroundColor: '#4a6bff',
                                color: 'white'
                            }}
                        >
                            <FaPaperPlane /> Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="auth-container" style={{
                width: '100%',
                maxWidth: '450px',
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div className="auth-header" style={{
                    background: 'linear-gradient(135deg, #4a6bff, #3a5bef)',
                    color: 'white',
                    padding: '30px',
                    textAlign: 'center'
                }}>
                    <div className="auth-logo" style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4a6bff',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}>
                        <FaStar />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Оставить отзыв</h1>
                    <p style={{ opacity: '0.9', fontSize: '0.95rem' }}>Поделитесь своим мнением о нашей гостинице</p>
                </div>

                <Navbar />

                <div className="auth-content" style={{ padding: '30px' }}>
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '15px',
                                borderRadius: '5px',
                                marginBottom: '20px'
                            }}>
                                Ваш отзыв успешно сохранен! Вы будете перенаправлены...
                            </div>
                            <FaStar className="fa-spin" style={{ fontSize: '30px', color: '#4a6bff' }} />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="rating" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#4a5568'
                                }}>Ваша оценка</label>
                                <div className="rating-container" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '20px'
                                }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`rating-star ${reviewData.rating >= star || hoverRating >= star ? 'active' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => handleRatingChange(star)}
                                            style={{
                                                color: reviewData.rating >= star || hoverRating >= star ? '#ffc107' : '#e2e8f0',
                                                cursor: 'pointer',
                                                fontSize: '24px',
                                                transition: 'color 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label htmlFor="comment" style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}>Комментарий</label>
                                <div className="input-with-icon" style={{ position: 'relative' }}>
                                    <FaComment style={{
                                        position: 'absolute',
                                        left: '15px',
                                        top: '15px',
                                        color: '#a0aec0',
                                        frontSize: '0.875rem'
                                    }} />
                                    <textarea
                                        id="comment"
                                        className="form-control"
                                        name="comment"
                                        placeholder="Напишите ваш отзыв здесь..."
                                        value={reviewData.comment}
                                        onChange={handleCommentChange}
                                        required
                                        style={{
                                            width: '80%',
                                            padding: '12px 15px 12px 45px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            minHeight: '120px',
                                            resize: 'vertical',
                                            backgroundColor: 'white',
                                            color: 'black'
                                        }}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="auth-error" style={{
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                    padding: '10px 15px',
                                    borderRadius: '5px',
                                    marginBottom: '20px',
                                    border: '1px solid #f5c6cb',
                                    fontSize: '0.9rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    backgroundColor: '#4a6bff',
                                    color: 'white'
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <FaStar className="fa-spin" />
                                        Отправка...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        Отправить отзыв
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="auth-footer" style={{
                    textAlign: 'center',
                    padding: '20px',
                    borderTop: '1px solid #edf2f7',
                    fontSize: '0.9rem',
                    color: '#718096'
                }}>
                    Спасибо за ваш отзыв! <a href="/hotels" style={{
                    color: '#4a6bff',
                    textDecoration: 'none',
                    fontWeight: '600'
                }}><FaHome /> Вернуться на главную</a>
                </div>
            </div>
        </div>
    );
};

export default WriteHotelReview;