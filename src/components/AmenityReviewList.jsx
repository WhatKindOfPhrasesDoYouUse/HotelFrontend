import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { FaSpinner } from "react-icons/fa";

const AmenityReviewList = () => {
    const { roomId } = useParams();

    const [amenityReviews, setAmenityReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5221/api/amenity-reviews/${roomId}/room/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`)
            .then((response) => {
                setAmenityReviews(response.data.items);
                setTotalPages(response.data.totalPages);
                setTotalCount(response.data.totalCount);
                setError(null);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Ошибка загрузки отзывов");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [pageNumber, roomId]);

    const goToPreviousPage = () => {
        if (pageNumber > 1) setPageNumber(prev => prev - 1);
    };

    const goToNextPage = () => {
        if (pageNumber < totalPages) setPageNumber(prev => prev + 1);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setPageNumber(page);
    };

    if (loading) return (
        <div className="reviews-container">
            <Navbar />
            <div className="reviews-header">
                <h1>Отзывы о дополнительных услугах</h1>
                <p>Узнайте, что говорят наши гости о наших услугах</p>
            </div>
            <div className="reviews-content loading">
                <FaSpinner className="spinner" />
                <p>Загрузка отзывов...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="reviews-container">
            <Navbar />
            <div className="reviews-header">
                <h1>Отзывы о дополнительных услугах</h1>
                <p>Узнайте, что говорят наши гости о наших услугах</p>
            </div>
            <div className="reviews-content">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        Попробовать снова
                    </button>
                </div>
            </div>
        </div>
    );

    if (amenityReviews.length === 0) return (
        <div className="reviews-container">
            <Navbar />
            <div className="reviews-header">
                <h1>Отзывы о дополнительных услугах</h1>
                <p>Узнайте, что говорят наши гости о наших услугах</p>
            </div>
            <div className="reviews-content">
                <div className="no-reviews">
                    <p>Отзывов о дополнительных услугах пока нет</p>
                    <a href={`/add-amenity-review/${roomId}`} className="add-review-link">
                        Будьте первым, кто оставит отзыв
                    </a>
                </div>
            </div>
        </div>
    );

    return (
        <div className="reviews-container">
            <Navbar/>
            <div className="reviews-header">
                <h1>Отзывы о дополнительных услугах</h1>
                <p>Узнайте, что говорят наши гости о наших услугах</p>
            </div>

            <div className="reviews-content">
                {amenityReviews.map(review => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="user-info">
                                <div className="avatar">
                                    {review.guest?.client?.name?.charAt(0) || 'Г'}
                                </div>
                                <div className="user-details">
                                    <h3>
                                        {review.guest?.client?.surname || 'Гость'}
                                        {review.guest?.client?.name ? ` ${review.guest.client.name}` : ''}
                                        {review.guest?.client?.patronymic ? ` ${review.guest.client.patronymic}` : ''}
                                    </h3>
                                    <div className="review-meta">
                                        <span
                                            className="date">{review.publicationDate} в {review.publicationTime?.substring(0, 5)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="rating">
                                {Array.from({length: 5}).map((_, i) => (
                                    <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                                        {i < review.rating ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="amenity-info">
                            <span className="label">Услуга:</span>
                            <span className="name">{review.amenity?.name || 'Неизвестная услуга'}</span>
                        </div>

                        <div className="review-text">
                            {review.comment || 'Пользователь не оставил комментарий'}
                        </div>
                    </div>
                ))}

                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={pageNumber === 1}
                            className="pagination-button first"
                        >
                            «
                        </button>
                        <button
                            onClick={goToPreviousPage}
                            disabled={pageNumber === 1}
                            className="pagination-button prev"
                        >
                            ‹
                        </button>

                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pageNumber <= 3) {
                                pageNum = i + 1;
                            } else if (pageNumber >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = pageNumber - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`pagination-button ${pageNum === pageNumber ? 'active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={goToNextPage}
                            disabled={pageNumber === totalPages}
                            className="pagination-button next"
                        >
                            ›
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={pageNumber === totalPages}
                            className="pagination-button last"
                        >
                            »
                        </button>
                    </div>
                </div>
            </div>

            <div className="reviews-footer">
                Хотите оставить отзыв? <a href="/add-review">Напишите нам</a>
            </div>

            <style jsx>{`
                .reviews-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .reviews-header {
                    background: linear-gradient(135deg, #4a6bff, #3a5bef);
                    color: white;
                    padding: 25px;
                    text-align: center;
                    position: relative;
                }

                .reviews-header h1 {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .reviews-header p {
                    font-size: 15px;
                    opacity: 0.9;
                    margin-bottom: 5px;
                }

                .total-reviews {
                    font-size: 14px;
                    opacity: 0.8;
                    margin-top: 10px;
                }

                .reviews-content {
                    padding: 20px;
                }

                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    gap: 15px;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                    font-size: 30px;
                    color: #4a6bff;
                }

                .reviews-footer {
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #edf2f7;
                    font-size: 0.9rem;
                    color: #718096;
                }

                .reviews-footer a {
                    color: #4a6bff;
                    text-decoration: none;
                    font-weight: 600;
                }

                .reviews-footer a:hover {
                    text-decoration: underline;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                .error-message {
                    background: #ffecec;
                    border: 1px solid #ffbdbd;
                    border-radius: 5px;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                }

                .error-message p {
                    color: #ff4444;
                    margin-bottom: 15px;
                }

                .retry-button {
                    background: #4a6bff;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.2s;
                }

                .retry-button:hover {
                    background: #3a5bef;
                }

                .no-reviews {
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                }

                .no-reviews p {
                    margin-bottom: 15px;
                }

                .add-review-link {
                    color: #4a6bff;
                    text-decoration: none;
                    font-weight: 500;
                }

                .add-review-link:hover {
                    text-decoration: underline;
                }

                .review-card {
                    border-bottom: 1px solid #eee;
                    padding: 20px 0;
                }

                .review-card:last-child {
                    border-bottom: none;
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .avatar {
                    width: 45px;
                    height: 45px;
                    background: #e6f0ff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #4a6bff;
                    font-size: 18px;
                }

                .user-details h3 {
                    margin: 0;
                    font-size: 16px;
                    color: #333;
                }

                .review-meta {
                    display: flex;
                    gap: 10px;
                    margin-top: 5px;
                    font-size: 13px;
                    color: #888;
                }

                .rating {
                    display: flex;
                    gap: 3px;
                }

                .star {
                    color: #ddd;
                    font-size: 18px;
                }

                .star.filled {
                    color: #ffc107;
                }

                .amenity-info {
                    margin-bottom: 15px;
                    font-size: 14px;
                }

                .amenity-info .label {
                    color: #666;
                    margin-right: 5px;
                }

                .amenity-info .name {
                    font-weight: 500;
                    color: #4a6bff;
                }

                .review-text {
                    line-height: 1.6;
                    color: #444;
                    white-space: pre-line;
                }

                .pagination-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 30px;
                    gap: 15px;
                }

                .pagination-info {
                    font-size: 14px;
                    color: #666;
                }

                .pagination-controls {
                    display: flex;
                    gap: 5px;
                }

                .pagination-button {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #ddd;
                    background: #fff;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pagination-button:hover:not(:disabled) {
                    border-color: #4a6bff;
                    color: #4a6bff;
                }

                .pagination-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .pagination-button.active {
                    background: #4a6bff;
                    color: white;
                    border-color: #4a6bff;
                }

                .reviews-footer {
                    text-align: center;
                    padding: 20px;
                    border-top: 1px solid #eee;
                }

                .reviews-footer p {
                    margin-bottom: 10px;
                    color: #666;
                }

                .add-review-button {
                    display: inline-block;
                    background: #4a6bff;
                    color: white;
                    padding: 10px 25px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .add-review-button:hover {
                    background: #3a5bef;
                }

                @media (max-width: 600px) {
                    .reviews-container {
                        border-radius: 0;
                    }

                    .reviews-header {
                        padding: 20px 15px;
                    }

                    .reviews-content {
                        padding: 15px;
                    }

                    .review-header {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .rating {
                        align-self: flex-start;
                    }

                    .pagination-controls {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default AmenityReviewList;