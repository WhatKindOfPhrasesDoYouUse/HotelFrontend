import { useEffect, useState } from "react";
import axios from "axios";

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

    if (loading) return <p>Загрузка отзывов...</p>;

    if (error) return <p>{error}</p>;

    if (hotelReviews.length === 0) return <p>Отзывов пока нет</p>;

    return (
        <div className="reviews-container">
            <h2>Отзывы об отелях</h2>
            {hotelReviews.map(review => (
                <div key={review.id} className="review-card">
                    <div className="review-header">
                        <h3>{review.hotel.name}</h3>
                        <div className="rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={`star ${i < review.rating ? 'filled' : ''}`}
                                >
                                    {i < review.rating ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="review-comment">{review.comment}</p>

                    <div className="review-meta">
                        <p>
                            <strong>Автор:</strong> {review.guest.client.surname} {review.guest.client.name} {review.guest.client.patronymic}
                        </p>
                        <p>
                            <strong>Дата:</strong> {review.publicationDate} в {review.publicationTime.substring(0, 5)}
                        </p>
                    </div>
                </div>
            ))}

            <div className="pagination-controls">
                <button onClick={goToPreviousPage} disabled={pageNumber === 1}>
                    ⬅ Назад
                </button>
                <span>Страница {pageNumber} из {totalPages}</span>
                <button onClick={goToNextPage} disabled={pageNumber === totalPages}>
                    Вперёд ➡
                </button>
            </div>
        </div>
    );
};

export default HotelReviewList;
