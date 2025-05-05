import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";

const HotelReviewList = () => {
    const [hotelReviews, setHotelReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://localhost:5221/api/hotel-reviews/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`)
            .then(response => {
                setHotelReviews(response.data.items);
                setTotalPages(response.data.totalPages);
                setError(null);
            })
            .catch(err => {
                setError("Ошибка загрузки отзывов");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [pageNumber]);

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
            <div className="reviews-header">
                <h1>Отзывы наших клиентов</h1>
                <p>Узнайте, что говорят о нас наши гости</p>
            </div>
            <div className="reviews-content">
                <p>Загрузка отзывов...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h1>Отзывы наших клиентов</h1>
                <p>Узнайте, что говорят о нас наши гости</p>
            </div>
            <div className="reviews-content">
                <div className="auth-error">{error}</div>
            </div>
        </div>
    );

    if (hotelReviews.length === 0) return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h1>Отзывы наших клиентов</h1>
                <p>Узнайте, что говорят о нас наши гости</p>
            </div>
            <div className="reviews-content">
                <div className="no-reviews">Отзывов пока нет</div>
            </div>
        </div>
    );

    return (
        <div className="reviews-container">
            <Navbar />
            <div className="reviews-header">
                <h1>Отзывы наших клиентов</h1>
                <p>Узнайте, что говорят о нас наши гости</p>
            </div>

            <div className="reviews-content">
                {hotelReviews.map(review => (
                    <div key={review.id} className="review">
                        <div className="review-header">
                            <div className="review-avatar">
                                {review.guest.client.name.charAt(0)}
                            </div>
                            <div>
                                <div className="review-author">
                                    {review.guest.client.surname} {review.guest.client.name} {review.guest.client.patronymic}
                                </div>
                                <div className="review-date">
                                    {review.publicationDate} в {review.publicationTime.substring(0, 5)}
                                </div>
                            </div>
                        </div>

                        <div className="review-hotel">
                            <strong>Гостиница:</strong> {review.hotel.name}
                        </div>

                        <div className="review-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < review.rating ? 'filled' : ''}>
                                    {i < review.rating ? '★' : '☆'}
                                </span>
                            ))}
                        </div>

                        <div className="review-text">
                            {review.comment}
                        </div>
                    </div>
                ))}

                <div className="pagination">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={pageNumber === 1}
                        className="pagination-button"
                    >
                        &laquo;
                    </button>

                    <button
                        onClick={goToPreviousPage}
                        disabled={pageNumber === 1}
                        className="pagination-button"
                    >
                        &lsaquo;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`pagination-button ${page === pageNumber ? 'current' : ''}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber === totalPages}
                        className="pagination-button"
                    >
                        &rsaquo;
                    </button>

                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={pageNumber === totalPages}
                        className="pagination-button"
                    >
                        &raquo;
                    </button>
                </div>
            </div>

            <div className="reviews-footer">
                Хотите оставить отзыв? <a href="/add-review">Напишите нам</a>
            </div>

            <style jsx>{`
                .reviews-container {
                    width: 100%;
                    max-width: 800px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin: 20px auto;
                }
                
                .reviews-header {
                    background: linear-gradient(135deg, #4a6bff, #3a5bef);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .reviews-header h1 {
                    font-size: 1.8rem;
                    margin-bottom: 10px;
                }
                
                .reviews-header p {
                    opacity: 0.9;
                    font-size: 0.95rem;
                }
                
                .reviews-content {
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
                
                .review {
                    border-bottom: 1px solid #edf2f7;
                    padding: 20px 0;
                }
                
                .review:last-child {
                    border-bottom: none;
                }
                
                .review-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .review-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background-color: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #4a6bff;
                    font-weight: bold;
                    font-size: 20px;
                    margin-right: 15px;
                }
                
                .review-author {
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 5px;
                }
                
                .review-date {
                    color: #718096;
                    font-size: 0.85rem;
                }
                
                .review-hotel {
                    margin-bottom: 10px;
                    font-size: 0.95rem;
                    color: #4a5568;
                }
                
                .review-rating {
                    color: #f6ad55;
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 1.2rem;
                }
                
                .review-rating .filled {
                    color: #f6ad55;
                }
                
                .review-text {
                    line-height: 1.6;
                    color: #4a5568;
                }
                
                .pagination {
                    display: flex;
                    justify-content: center;
                    margin-top: 30px;
                    gap: 5px;
                    flex-wrap: wrap;
                }
                
                .pagination-button {
                    padding: 8px 15px;
                    border-radius: 5px;
                    text-decoration: none;
                    color: #4a5568;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border: 1px solid #e2e8f0;
                    background-color: white;
                    cursor: pointer;
                    font-size: 1rem;
                }
                
                .pagination-button:hover:not(:disabled) {
                    background-color: #4a6bff;
                    color: white;
                    border-color: #4a6bff;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                .pagination-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .pagination-button.current {
                    background-color: #4a6bff;
                    color: white;
                    border: 1px solid #4a6bff;
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
                
                .no-reviews {
                    text-align: center;
                    padding: 40px 0;
                    color: #718096;
                }
                
                @media (max-width: 600px) {
                    .reviews-container {
                        margin: 10px;
                    }
                    
                    .reviews-header {
                        padding: 20px;
                    }
                
                    .reviews-content {
                        padding: 20px;
                    }
                    
                    .review-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .review-avatar {
                        margin-bottom: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default HotelReviewList;